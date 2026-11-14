import os
import time
import json
import shutil
import logging
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

from .schemas import ComplianceMatrix, CompleteBidDraft, AnalyzeRFPResponse
from .agents import shred_rfp, draft_bid_packet, load_company_vault, VAULT_PATH
from .docx_builder import generate_docx_proposal

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("civicscribe.api")

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
