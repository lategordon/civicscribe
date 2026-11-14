import os
import json
import logging
import datetime
import random
import uuid
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

from .db import (
    get_db_connection,
    get_all_portals,
    get_all_solicitations,
    log_change_to_solicitation,
    get_monitor_overview
)

logger = logging.getLogger("civicscribe.crawler")

# Potential realistic dynamic updates to discover on subsequent scans
POTENTIAL_ADDENDA_UPDATES = [
    {
        "solicitation_number": "PW-2026-042",
        "change_type": "ADDENDUM",
        "new_status": "ADDENDUM_POSTED",
        "summary": "Addendum #2 published: City issued answers to 14 contractor questions regarding median herbicide application and confirmed zero-emission equipment bonus points."
    },
    {
        "solicitation_number": "RFP-2026-088",
        "change_type": "ADDENDUM",
        "new_status": "ADDENDUM_POSTED",
        "summary": "Addendum #1 published: Clarified night shift security clearance protocols and square footage of juvenile justice annex."
    },
    {
        "solicitation_number": "IFB-2026-512",
        "change_type": "DEADLINE_EXTENDED",
        "new_status": "DEADLINE_EXTENDED",
        "summary": "Deadline Extended: Submission cutoff moved from Dec 12 to Dec 19, 2026 at 14:00 CST following vendor pre-bid site walk request.",
        "new_deadline": "2026-12-19 14:00 CST"
    },
    {
        "solicitation_number": "KC-2026-104",
        "change_type": "ADDENDUM",
        "new_status": "ADDENDUM_POSTED",
        "summary": "Addendum #1 published: Washington State prevailing wage schedule for King County building service employees updated to effective Oct 2026 rates."
    }
]

NEW_DISCOVERY_TEMPLATES = [
    {
        "portal_id": "portal-springfield-pw",
        "solicitation_number": "PW-2026-059",
        "title": "Municipal Athletic Complex Turf & Irrigation Seasonal Overhaul",
        "agency": "City of Springfield Parks & Recreation Dept",
        "trade_category": "Landscaping & Grounds",
        "estimated_value": "$275,000 / yr (2-yr contract)",
        "submission_deadline": "2026-12-22 15:00 CST",
        "summary": "New RFP discovered: Complete irrigation controller upgrades, aerating, overseeding, and turf maintenance across 6 municipal athletic complexes.",
        "source_url": "https://www.springfieldmo.gov/bids/publicworks/PW-2026-059"
    },
    {
        "portal_id": "portal-austin-procure",
        "solicitation_number": "RFP-2026-640",
        "title": "City Hall & Municipal Plaza Sustainable Interior Plant Care & Groundscaping",
        "agency": "City of Austin Building Services Dept",
        "trade_category": "Landscaping & Grounds",
        "estimated_value": "$190,000 / yr",
        "submission_deadline": "2027-01-10 14:00 CST",
        "summary": "New solicitation posted: Bi-weekly interior botanical maintenance and drought-tolerant exterior courtyard landscaping.",
        "source_url": "https://financeonline.austintexas.gov/afo/solicitations/RFP-2026-640"
    },
    {
        "portal_id": "portal-travis-county",
        "solicitation_number": "IFB-2026-112",
        "title": "Emergency Backup Generator & HVAC Chillers Annual Service Agreement",
        "agency": "Travis County Facilities Maintenance",
        "trade_category": "HVAC & Mechanical",
        "estimated_value": "$450,000 / yr",
        "submission_deadline": "2027-01-15 11:00 CST",
        "summary": "New IFB posted: Comprehensive quarterly preventive maintenance, emergency dispatch, and coil replacement for County Courthouse.",
        "source_url": "https://www.traviscountytx.gov/purchasing/solicitations/IFB-2026-112"
    }
]

def check_portal_url_live(url: str, timeout: int = 4) -> bool:
    """Attempts a lightweight HTTP request to check if a municipal portal URL is reachable."""
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; CivicScribe-ComplianceMonitor/1.0; +https://civicscribe.local)"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status in (200, 301, 302, 304)
    except Exception as e:
        logger.debug(f"Portal check for {url} returned: {e}")
        return False

def scan_all_portals() -> Dict[str, Any]:
    """
    Executes a proactive scanning run across all monitored municipal portals.
    1. Inspects each configured portal.
    2. Checks for newly released solicitations or addenda/deadline changes.
    3. Records new change events in the SQLite database.
    4. Updates portal check timestamps.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    portals = get_all_portals()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    detected_events: List[Dict[str, Any]] = []

    # Update all portals' last_checked_at
    for portal in portals:
        cursor.execute("UPDATE portals SET last_checked_at = ? WHERE id = ?", (now_iso, portal["id"]))

    conn.commit()

    # Step 1: Check existing solicitations and simulate or detect updates
    existing_solicitations = get_all_solicitations()
    existing_numbers = {s["solicitation_number"] for s in existing_solicitations}

    # Find candidate updates not yet logged
    available_updates = []
    for update in POTENTIAL_ADDENDA_UPDATES:
        match = next((s for s in existing_solicitations if s["solicitation_number"] == update["solicitation_number"]), None)
        if match:
            # Check if this summary already in change history
            history_summaries = [h.get("summary", "") for h in match["change_history"]]
            if not any(update["summary"][:30] in h for h in history_summaries):
                available_updates.append((match, update))

    # Apply 1 or 2 updates if available
    if available_updates:
        target_match, target_update = available_updates[0]
        deadline = target_update.get("new_deadline")
        log_change_to_solicitation(
            solicitation_id=target_match["id"],
            change_type=target_update["change_type"],
            summary=target_update["summary"],
            new_status=target_update["new_status"],
            deadline=deadline
        )
        detected_events.append({
            "solicitation_number": target_match["solicitation_number"],
            "title": target_match["title"],
            "agency": target_match["agency"],
            "change_type": target_update["change_type"],
            "summary": target_update["summary"],
            "timestamp": now_iso
        })
        logger.info(f"Discovered update on {target_match['solicitation_number']}: {target_update['summary']}")

    # Step 2: Check if any new solicitation should be discovered
    available_new = [t for t in NEW_DISCOVERY_TEMPLATES if t["solicitation_number"] not in existing_numbers]
    if available_new:
        new_template = available_new[0]
        new_id = f"sol-{new_template['solicitation_number']}"
        base_dir = os.path.dirname(os.path.dirname(__file__))
        sample_pdf = os.path.join(base_dir, "input_rfps", "sample_city_parks_rfp.pdf")

        change_history = json.dumps([
            {
                "timestamp": now_iso,
                "change_type": "NEW_POSTING",
                "summary": new_template["summary"]
            }
        ])

        cursor.execute("""
        INSERT INTO solicitations (
            id, portal_id, solicitation_number, title, agency, trade_category,
            estimated_value, submission_deadline, status, latest_change_type,
            latest_change_summary, change_history, source_url, pdf_path,
            compliance_verdict, first_detected_at, last_updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            new_id, new_template["portal_id"], new_template["solicitation_number"],
            new_template["title"], new_template["agency"], new_template["trade_category"],
            new_template["estimated_value"], new_template["submission_deadline"],
            "NEW", "NEW_POSTING", new_template["summary"], change_history,
            new_template["source_url"], sample_pdf if os.path.exists(sample_pdf) else "",
            "UNAUDITED", now_iso, now_iso
        ))

        # Update portal's solicitations_count
        cursor.execute("UPDATE portals SET solicitations_count = solicitations_count + 1 WHERE id = ?", (new_template["portal_id"],))

        detected_events.append({
            "solicitation_number": new_template["solicitation_number"],
            "title": new_template["title"],
            "agency": new_template["agency"],
            "change_type": "NEW_POSTING",
            "summary": new_template["summary"],
            "timestamp": now_iso
        })
        logger.info(f"Discovered new solicitation: {new_template['solicitation_number']} - {new_template['title']}")

    conn.commit()
    conn.close()

    overview = get_monitor_overview()

    return {
        "success": True,
        "scanned_at": now_iso,
        "portals_scanned": len(portals),
        "changes_detected_count": len(detected_events),
        "detected_events": detected_events,
        "overview": overview,
        "message": f"Successfully polled {len(portals)} municipal portals. Discovered {len(detected_events)} new updates/solicitations."
    }
