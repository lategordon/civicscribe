import os
import time
import json
import shutil
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

from .schemas import (
    ComplianceMatrix,
    CompleteBidDraft,
    AnalyzeRFPResponse,
    MonitoredPortal,
    AddPortalRequest,
    DiscoveredSolicitation,
    MonitorOverview,
    ScanPortalsResponse
)
from .agents import shred_rfp, draft_bid_packet, load_company_vault, VAULT_PATH
from .docx_builder import generate_docx_proposal
from .db import (
    init_db,
    get_all_portals,
    add_portal,
    delete_portal,
    get_all_solicitations,
    get_solicitation_by_id,
    update_solicitation_verdict,
    get_monitor_overview
)
from .portal_crawler import scan_all_portals

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("civicscribe.api")

# Initialize SQLite database
init_db()

app = FastAPI(
    title="CivicScribe API",
    description="AI Municipal RFP Compliance Auditor & Proposal Bid Writer Backend",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
INPUT_DIR = os.path.join(BASE_DIR, "input_rfps")
OUTPUT_DIR = os.path.join(BASE_DIR, "output_bids")

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "CivicScribe Backend",
        "has_gemini_key": bool(os.getenv("GEMINI_API_KEY")),
        "model": os.getenv("CIVICSCRIBE_MODEL", "gemini-3.1-flash-lite")
    }

@app.get("/api/vault")
async def get_company_vault():
    """Returns the verified company profile and qualifications from the vault."""
    try:
        if not os.path.exists(VAULT_PATH):
            raise HTTPException(status_code=404, detail="Company vault file not found")
        with open(VAULT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Failed to read vault: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/vault")
async def update_company_vault(updated_data: Dict[str, Any]):
    """Updates the verified company profile in the vault."""
    try:
        with open(VAULT_PATH, "w", encoding="utf-8") as f:
            json.dump(updated_data, f, indent=2)
        logger.info("Successfully updated company vault profile")
        return {"success": True, "message": "Company vault successfully updated", "data": updated_data}
    except Exception as e:
        logger.error(f"Failed to update vault: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-rfp", response_model=AnalyzeRFPResponse)
async def analyze_rfp(file: UploadFile = File(...)):
    """
    Accepts a multipart RFP PDF upload, executes the multi-agent pipeline:
    1. shred_rfp: audits compliance, flags disqualifiers, extracts rubric and forms, outputs Go/No-Go verdict.
    2. draft_bid_packet: adheres strictly to anti-hallucination invariant, drafts narrative proposal.
    3. compiles submission-ready .docx document into output_bids/.
    """
    start_time = time.time()

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported for RFP analysis.")

    # Save uploaded file
    safe_name = f"upload_{int(time.time())}_{file.filename.replace(' ', '_')}"
    saved_pdf_path = os.path.join(INPUT_DIR, safe_name)

    try:
        with open(saved_pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Saved uploaded RFP to: {saved_pdf_path}")

        # Step 1: Execute shred_rfp agent
        logger.info("Starting Agent 1: shred_rfp...")
        compliance_matrix = await shred_rfp(saved_pdf_path)
        logger.info(f"shred_rfp completed with verdict: {compliance_matrix.verdict}")

        # Step 2: Execute draft_bid_packet agent
        logger.info("Starting Agent 2: draft_bid_packet...")
        bid_draft = await draft_bid_packet(saved_pdf_path, compliance_matrix)
        logger.info(f"draft_bid_packet completed with {len(bid_draft.sections)} sections")

        # Step 3: Build formatted .docx proposal packet
        logger.info("Compiling formatted .docx packet...")
        docx_filename = generate_docx_proposal(
            matrix=compliance_matrix,
            draft=bid_draft,
            output_dir=OUTPUT_DIR
        )
        download_url = f"/api/download/{docx_filename}"

        elapsed = round(time.time() - start_time, 2)
        logger.info(f"Full RFP audit and proposal generation completed in {elapsed}s")

        return AnalyzeRFPResponse(
            success=True,
            compliance_matrix=compliance_matrix,
            bid_draft=bid_draft,
            docx_filename=docx_filename,
            download_url=download_url,
            execution_time_seconds=elapsed,
            message="RFP successfully audited and proposal bid packet drafted."
        )

    except Exception as e:
        logger.exception("Error during RFP analysis pipeline")
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline error while auditing RFP: {str(e)}"
        )

@app.get("/input_rfps/{filename}")
async def get_input_rfp(filename: str):
    """Serves sample or uploaded RFP PDFs."""
    clean_filename = os.path.basename(filename)
    file_path = os.path.join(INPUT_DIR, clean_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="application/pdf", filename=clean_filename)

@app.get("/api/download/{filename}")
async def download_bid_packet(filename: str):
    """Serves the generated .docx proposal document for download."""
    # Prevent directory traversal
    clean_filename = os.path.basename(filename)
    file_path = os.path.join(OUTPUT_DIR, clean_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Requested bid packet document not found.")

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=clean_filename
    )


# ============================================================================
# Proactive Municipal Portal Monitor Endpoints
# ============================================================================

@app.get("/api/monitor/overview", response_model=MonitorOverview)
async def get_monitor_stats():
    """Returns top-level metric counters for active municipal portals, solicitations, and recent changes."""
    return get_monitor_overview()

@app.get("/api/monitor/portals", response_model=List[MonitoredPortal])
async def list_monitored_portals():
    """Returns list of all configured municipal procurement websites being tracked."""
    return get_all_portals()

@app.post("/api/monitor/portals", response_model=MonitoredPortal)
async def add_monitored_portal(req: AddPortalRequest):
    """Adds a new municipal portal website to track."""
    if not req.name.strip() or not req.portal_url.strip():
        raise HTTPException(status_code=400, detail="Name and Portal URL are required.")
    return add_portal(
        name=req.name.strip(),
        jurisdiction=req.jurisdiction.strip(),
        portal_url=req.portal_url.strip(),
        target_trades=req.target_trades,
        check_interval_minutes=req.check_interval_minutes
    )

@app.delete("/api/monitor/portals/{portal_id}")
async def remove_monitored_portal(portal_id: str):
    """Deletes a tracked portal and its associated solicitations."""
    success = delete_portal(portal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Portal not found.")
    return {"success": True, "message": "Portal successfully removed from monitoring."}

@app.get("/api/monitor/solicitations", response_model=List[DiscoveredSolicitation])
async def list_discovered_solicitations(category: Optional[str] = None, status: Optional[str] = None):
    """Returns all discovered solicitations and change logs, optionally filtered by trade category or status."""
    return get_all_solicitations(category=category, status=status)

@app.post("/api/monitor/scan", response_model=ScanPortalsResponse)
async def trigger_portal_scan():
    """
    Triggers an immediate proactive polling scan across all monitored government portals,
    detects changes (new RFPs, addenda, deadline shifts), updates the database, and returns new events.
    """
    try:
        result = scan_all_portals()
        return result
    except Exception as e:
        logger.exception("Error during proactive portal scan")
        raise HTTPException(status_code=500, detail=f"Failed to scan portals: {str(e)}")

@app.post("/api/monitor/audit-discovered/{solicitation_id}", response_model=AnalyzeRFPResponse)
async def audit_discovered_solicitation(solicitation_id: str):
    """
    1-Click Proactive Workflow:
    Takes an auto-discovered solicitation from the database, retrieves its associated RFP document,
    and runs the full CivicScribe multi-agent compliance audit & proposal generation pipeline.
    """
    start_time = time.time()
    sol = get_solicitation_by_id(solicitation_id)
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitation not found in database.")

    pdf_path = sol.get("pdf_path")
    if not pdf_path or not os.path.exists(pdf_path):
        # Fallback to sample PDF if none specifically assigned
        default_pdf = os.path.join(INPUT_DIR, "sample_city_parks_rfp.pdf")
        if os.path.exists(default_pdf):
            pdf_path = default_pdf
        else:
            raise HTTPException(status_code=400, detail="No RFP PDF document found for this solicitation to audit.")

    try:
        logger.info(f"Proactive 1-Click Audit started for discovered solicitation {sol['solicitation_number']}...")
        compliance_matrix = await shred_rfp(pdf_path)
        bid_draft = await draft_bid_packet(pdf_path, compliance_matrix)

        docx_filename = generate_docx_proposal(
            matrix=compliance_matrix,
            draft=bid_draft,
            output_dir=OUTPUT_DIR
        )
        download_url = f"/api/download/{docx_filename}"
        elapsed = round(time.time() - start_time, 2)

        # Update cached verdict in DB
        update_solicitation_verdict(solicitation_id, compliance_matrix.verdict)

        return AnalyzeRFPResponse(
            success=True,
            compliance_matrix=compliance_matrix,
            bid_draft=bid_draft,
            docx_filename=docx_filename,
            download_url=download_url,
            execution_time_seconds=elapsed,
            message=f"Discovered RFP {sol['solicitation_number']} successfully audited. Verdict: {compliance_matrix.verdict}."
        )
    except Exception as e:
        logger.exception(f"Error auditing discovered solicitation {solicitation_id}")
        raise HTTPException(status_code=500, detail=f"Error auditing solicitation: {str(e)}")
