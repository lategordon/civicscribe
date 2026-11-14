import os
import json
import sqlite3
import uuid
import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "civic_monitor.db")

os.makedirs(DB_DIR, exist_ok=True)

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables for portals, solicitations, and change logs."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS portals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        jurisdiction TEXT NOT NULL,
        portal_url TEXT NOT NULL,
        target_trades TEXT NOT NULL, -- JSON array of strings
        check_interval_minutes INTEGER DEFAULT 60,
        last_checked_at TEXT,
        status TEXT DEFAULT 'active', -- 'active', 'paused', 'error'
        solicitations_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS solicitations (
        id TEXT PRIMARY KEY,
        portal_id TEXT NOT NULL,
        solicitation_number TEXT NOT NULL,
        title TEXT NOT NULL,
        agency TEXT NOT NULL,
        trade_category TEXT NOT NULL,
        estimated_value TEXT,
        submission_deadline TEXT NOT NULL,
        status TEXT NOT NULL, -- 'NEW', 'ADDENDUM_POSTED', 'DEADLINE_EXTENDED', 'ACTIVE', 'ARCHIVED'
        latest_change_type TEXT, -- 'NEW_POSTING', 'ADDENDUM', 'DEADLINE_EXTENDED', 'NONE'
        latest_change_summary TEXT,
        change_history TEXT NOT NULL, -- JSON array of change objects
        source_url TEXT NOT NULL,
        pdf_path TEXT,
        compliance_verdict TEXT DEFAULT 'UNAUDITED', -- 'UNAUDITED', 'GO', 'CONDITIONAL GO', 'NO-GO'
        first_detected_at TEXT NOT NULL,
        last_updated_at TEXT NOT NULL,
        FOREIGN KEY (portal_id) REFERENCES portals(id)
    )
    """)

    conn.commit()
    conn.close()

    # Pre-populate default portals and solicitations if empty
    seed_default_data_if_empty()

def seed_default_data_if_empty():
    """Seeds realistic municipal procurement portals and active solicitations if database is fresh."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as cnt FROM portals")
    count = cursor.fetchone()["cnt"]
    if count > 0:
        conn.close()
        return

    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    two_hours_ago = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)).isoformat()
    yesterday = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)).isoformat()

    default_portals = [
        {
            "id": "portal-springfield-pw",
            "name": "City of Springfield — Public Works & Parks Procurement",
            "jurisdiction": "City of Springfield, MO",
            "portal_url": "https://www.springfieldmo.gov/bids/publicworks",
            "target_trades": json.dumps(["Landscaping & Grounds", "Facility Maintenance"]),
            "check_interval_minutes": 60,
            "last_checked_at": two_hours_ago,
            "status": "active",
            "solicitations_count": 2,
            "created_at": yesterday
        },
        {
            "id": "portal-travis-county",
            "name": "Travis County Purchasing Office Solicitations",
            "jurisdiction": "Travis County, TX",
            "portal_url": "https://www.traviscountytx.gov/purchasing/solicitations",
            "target_trades": json.dumps(["Janitorial & Custodial", "Facility Maintenance"]),
            "check_interval_minutes": 120,
            "last_checked_at": two_hours_ago,
            "status": "active",
            "solicitations_count": 2,
            "created_at": yesterday
        },
        {
            "id": "portal-austin-procure",
            "name": "City of Austin Financial Services — Vendor Connection",
            "jurisdiction": "City of Austin, TX",
            "portal_url": "https://financeonline.austintexas.gov/afo/solicitations",
            "target_trades": json.dumps(["HVAC & Mechanical", "Landscaping & Grounds"]),
            "check_interval_minutes": 60,
            "last_checked_at": now,
            "status": "active",
            "solicitations_count": 1,
            "created_at": yesterday
        },
        {
            "id": "portal-king-county",
            "name": "King County Procurement & Contract Services",
            "jurisdiction": "King County, WA",
            "portal_url": "https://kingcounty.gov/procurement/bids",
            "target_trades": json.dumps(["Janitorial & Custodial", "HVAC & Mechanical"]),
            "check_interval_minutes": 180,
            "last_checked_at": yesterday,
            "status": "active",
            "solicitations_count": 1,
            "created_at": yesterday
        }
    ]

    for p in default_portals:
        cursor.execute("""
        INSERT INTO portals (id, name, jurisdiction, portal_url, target_trades, check_interval_minutes, last_checked_at, status, solicitations_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["id"], p["name"], p["jurisdiction"], p["portal_url"], p["target_trades"],
            p["check_interval_minutes"], p["last_checked_at"], p["status"], p["solicitations_count"], p["created_at"]
        ))

    # Base dir for sample RFP PDF
    base_dir = os.path.dirname(os.path.dirname(__file__))
    sample_pdf = os.path.join(base_dir, "input_rfps", "sample_city_parks_rfp.pdf")

    default_solicitations = [
        {
            "id": "sol-PW-2026-042",
            "portal_id": "portal-springfield-pw",
            "solicitation_number": "PW-2026-042",
            "title": "Municipal Parks & Median Grounds Maintenance Services",
            "agency": "City of Springfield Dept of Public Works",
            "trade_category": "Landscaping & Grounds",
            "estimated_value": "$420,000 / yr (3-yr contract)",
            "submission_deadline": "2026-12-05 14:00 CST",
            "status": "ADDENDUM_POSTED",
            "latest_change_type": "ADDENDUM",
            "latest_change_summary": "Addendum #1 published: Mandatory pre-bid conference relocated to City Hall Room 204; updated wage determination attached.",
            "change_history": json.dumps([
                {
                    "timestamp": two_hours_ago,
                    "change_type": "ADDENDUM",
                    "summary": "Addendum #1 posted: Modified mandatory pre-bid walkthrough location & clarified mulch depth requirements in Section 3.2."
                },
                {
                    "timestamp": yesterday,
                    "change_type": "NEW_POSTING",
                    "summary": "Original Solicitation published on Springfield Public Works procurement portal."
                }
            ]),
            "source_url": "https://www.springfieldmo.gov/bids/publicworks/PW-2026-042",
            "pdf_path": sample_pdf if os.path.exists(sample_pdf) else "",
            "compliance_verdict": "GO",
            "first_detected_at": yesterday,
            "last_updated_at": two_hours_ago
        },
        {
            "id": "sol-TC-2026-088",
            "portal_id": "portal-travis-county",
            "solicitation_number": "RFP-2026-088",
            "title": "County Administration Complex Janitorial & Disinfection Services",
            "agency": "Travis County Facilities Management",
            "trade_category": "Janitorial & Custodial",
            "estimated_value": "$680,000 / yr (2-yr base + 2 option yrs)",
            "submission_deadline": "2026-11-28 15:00 CST",
            "status": "DEADLINE_EXTENDED",
            "latest_change_type": "DEADLINE_EXTENDED",
            "latest_change_summary": "Deadline Extended by 7 days to Nov 28, 2026 due to vendor Q&A period extension.",
            "change_history": json.dumps([
                {
                    "timestamp": two_hours_ago,
                    "change_type": "DEADLINE_EXTENDED",
                    "summary": "Submission deadline extended from Nov 21 to Nov 28, 2026 per County Addendum #2."
                },
                {
                    "timestamp": yesterday,
                    "change_type": "NEW_POSTING",
                    "summary": "Solicitation discovered on Travis County procurement board."
                }
            ]),
            "source_url": "https://www.traviscountytx.gov/purchasing/solicitations/RFP-2026-088",
            "pdf_path": sample_pdf if os.path.exists(sample_pdf) else "",
            "compliance_verdict": "UNAUDITED",
            "first_detected_at": yesterday,
            "last_updated_at": two_hours_ago
        },
        {
            "id": "sol-ATX-2026-512",
            "portal_id": "portal-austin-procure",
            "solicitation_number": "IFB-2026-512",
            "title": "Austin Convention Center Preventive HVAC & Chiller Maintenance",
            "agency": "City of Austin Financial Services / Convention Dept",
            "trade_category": "HVAC & Mechanical",
            "estimated_value": "$890,000 / yr (3-yr contract)",
            "submission_deadline": "2026-12-12 11:00 CST",
            "status": "NEW",
            "latest_change_type": "NEW_POSTING",
            "latest_change_summary": "Newly published 3 hours ago: Full solicitation document & equipment schedules posted.",
            "change_history": json.dumps([
                {
                    "timestamp": now,
                    "change_type": "NEW_POSTING",
                    "summary": "New RFP discovered on Austin Financial Services portal."
                }
            ]),
            "source_url": "https://financeonline.austintexas.gov/afo/solicitations/IFB-2026-512",
            "pdf_path": sample_pdf if os.path.exists(sample_pdf) else "",
            "compliance_verdict": "UNAUDITED",
            "first_detected_at": now,
            "last_updated_at": now
        },
        {
            "id": "sol-KC-2026-104",
            "portal_id": "portal-king-county",
            "solicitation_number": "KC-2026-104",
            "title": "Regional Transit Centers Nightly Cleaning & Sanitization",
            "agency": "King County Metro Transit Division",
            "trade_category": "Janitorial & Custodial",
            "estimated_value": "$525,000 / yr",
            "submission_deadline": "2026-12-18 14:00 PST",
            "status": "ACTIVE",
            "latest_change_type": "NONE",
            "latest_change_summary": "No new changes detected since initial publication. Questions period open.",
            "change_history": json.dumps([
                {
                    "timestamp": yesterday,
                    "change_type": "NEW_POSTING",
                    "summary": "Solicitation indexed from King County Procurement board."
                }
            ]),
            "source_url": "https://kingcounty.gov/procurement/bids/KC-2026-104",
            "pdf_path": sample_pdf if os.path.exists(sample_pdf) else "",
            "compliance_verdict": "CONDITIONAL GO",
            "first_detected_at": yesterday,
            "last_updated_at": yesterday
        }
    ]

    for s in default_solicitations:
        cursor.execute("""
        INSERT INTO solicitations (
            id, portal_id, solicitation_number, title, agency, trade_category,
            estimated_value, submission_deadline, status, latest_change_type,
            latest_change_summary, change_history, source_url, pdf_path,
            compliance_verdict, first_detected_at, last_updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"], s["portal_id"], s["solicitation_number"], s["title"], s["agency"], s["trade_category"],
            s["estimated_value"], s["submission_deadline"], s["status"], s["latest_change_type"],
            s["latest_change_summary"], s["change_history"], s["source_url"], s["pdf_path"],
            s["compliance_verdict"], s["first_detected_at"], s["last_updated_at"]
        ))

    conn.commit()
    conn.close()

def get_all_portals() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM portals ORDER BY created_at DESC")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        item = dict(r)
        item["target_trades"] = json.loads(item["target_trades"])
        results.append(item)
    conn.close()
    return results

def add_portal(name: str, jurisdiction: str, portal_url: str, target_trades: List[str], check_interval_minutes: int = 60) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    new_id = f"portal-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cursor.execute("""
    INSERT INTO portals (id, name, jurisdiction, portal_url, target_trades, check_interval_minutes, last_checked_at, status, solicitations_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, name, jurisdiction, portal_url, json.dumps(target_trades),
        check_interval_minutes, now, "active", 0, now
    ))
    conn.commit()
    conn.close()
    return {
        "id": new_id,
        "name": name,
        "jurisdiction": jurisdiction,
        "portal_url": portal_url,
        "target_trades": target_trades,
        "check_interval_minutes": check_interval_minutes,
        "last_checked_at": now,
        "status": "active",
        "solicitations_count": 0,
        "created_at": now
    }

def delete_portal(portal_id: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM solicitations WHERE portal_id = ?", (portal_id,))
    cursor.execute("DELETE FROM portals WHERE id = ?", (portal_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_all_solicitations(category: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT s.*, p.name as portal_name, p.jurisdiction FROM solicitations s JOIN portals p ON s.portal_id = p.id WHERE 1=1"
    params = []

    if category and category.lower() != "all":
        query += " AND s.trade_category LIKE ?"
        params.append(f"%{category}%")

    if status and status.lower() != "all":
        query += " AND s.status = ?"
        params.append(status)

    query += " ORDER BY s.last_updated_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    results = []
    for r in rows:
        item = dict(r)
        item["change_history"] = json.loads(item["change_history"])
        results.append(item)
    conn.close()
    return results

def get_solicitation_by_id(solicitation_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT s.*, p.name as portal_name, p.jurisdiction FROM solicitations s JOIN portals p ON s.portal_id = p.id WHERE s.id = ?", (solicitation_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    item = dict(row)
    item["change_history"] = json.loads(item["change_history"])
    return item

def update_solicitation_verdict(solicitation_id: str, verdict: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE solicitations SET compliance_verdict = ?, last_updated_at = ? WHERE id = ?", (
        verdict, datetime.datetime.now(datetime.timezone.utc).isoformat(), solicitation_id
    ))
    conn.commit()
    conn.close()

def log_change_to_solicitation(solicitation_id: str, change_type: str, summary: str, new_status: str, deadline: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT change_history FROM solicitations WHERE id = ?", (solicitation_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return

    history = json.loads(row["change_history"])
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    history.insert(0, {
        "timestamp": now,
        "change_type": change_type,
        "summary": summary
    })

    if deadline:
        cursor.execute("""
        UPDATE solicitations
        SET latest_change_type = ?, latest_change_summary = ?, status = ?, submission_deadline = ?, change_history = ?, last_updated_at = ?
        WHERE id = ?
        """, (change_type, summary, new_status, deadline, json.dumps(history), now, solicitation_id))
    else:
        cursor.execute("""
        UPDATE solicitations
        SET latest_change_type = ?, latest_change_summary = ?, status = ?, change_history = ?, last_updated_at = ?
        WHERE id = ?
        """, (change_type, summary, new_status, json.dumps(history), now, solicitation_id))

    conn.commit()
    conn.close()

def get_monitor_overview():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as count FROM portals WHERE status = 'active'")
    active_portals = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM solicitations")
    total_solicitations = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM solicitations WHERE status IN ('NEW', 'ADDENDUM_POSTED', 'DEADLINE_EXTENDED')")
    recent_changes = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM solicitations WHERE compliance_verdict = 'GO'")
    go_verdicts = cursor.fetchone()["count"]

    conn.close()
    return {
        "active_portals_count": active_portals,
        "total_solicitations_count": total_solicitations,
        "recent_changes_count": recent_changes,
        "go_opportunities_count": go_verdicts,
        "last_monitored_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
