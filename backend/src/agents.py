import os
import re
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any

# Ensure local websocket harness does not route through HTTP proxies
os.environ["NO_PROXY"] = "127.0.0.1,localhost"
os.environ["no_proxy"] = "127.0.0.1,localhost"

from google.antigravity import Agent, LocalAgentConfig
from google.antigravity.hooks import policy
from google.antigravity.types import Document

from .schemas import ComplianceMatrix, CompleteBidDraft

logger = logging.getLogger("civicscribe.agents")

DEFAULT_MODEL = os.getenv("CIVICSCRIBE_MODEL", "gemini-3.1-flash-lite")
VAULT_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vault", "company_profile.json")

def load_company_vault() -> str:
    """
    Loads and returns the contractor's verified company profile, licenses,
    insurance limits, certifications, safety records, and past municipal contracts
    from the local company vault file.
    """
    try:
        if os.path.exists(VAULT_PATH):
            with open(VAULT_PATH, "r", encoding="utf-8") as f:
                return f.read()
    except Exception as e:
        logger.error(f"Error loading company vault: {e}")
    return "{}"

def parse_json_from_text(raw_text: str) -> Optional[Dict[str, Any]]:
    """Helper fallback to extract JSON object from text if structured_output is empty."""
    if not raw_text:
        return None
    raw_text = raw_text.strip()
    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, re.DOTALL)
    if fence_match:
        try:
            return json.loads(fence_match.group(1))
        except Exception:
            pass
    first_brace = raw_text.find("{")
    last_brace = raw_text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(raw_text[first_brace:last_brace+1])
        except Exception:
            pass
    return None

async def shred_rfp(rfp_pdf_path: str, vault_override: Optional[Dict[str, Any]] = None) -> ComplianceMatrix:
    """
    First Agent: Shreds the municipal RFP document, cross-examines mandatory qualifications
    against the verified company vault, detects hard disqualifiers with exact RFP citations,
    analyzes the scoring rubric weights, and produces the ComplianceMatrix with a GO/CONDITIONAL GO/NO-GO verdict.
    """
    vault_str = json.dumps(vault_override, indent=2) if vault_override else load_company_vault()
    schema_json = json.dumps(ComplianceMatrix.model_json_schema(), indent=2)

    system_instructions = (
        "You are an elite Municipal Procurement Compliance Auditor and RFP Shredder for local service contractors "
        "(landscape maintenance, janitorial, HVAC, and facilities). "
        "Your mission is to perform an exhaustive, unforgiving forensic audit of the municipal RFP against the "
        "vendor's verified credentials in the Company Vault.\n\n"
        "CORE RULES & EVALUATION PROTOCOL:\n"
        "1. Extract accurate solicitation metadata: agency name, solicitation number, full title, strict due date, "
        "and pre-bid meeting requirements (mandatory vs optional, date, location/link).\n"
        "2. AUDIT HARD DISQUALIFIERS: Identify all mandatory minimum qualifications (e.g., CSLB Contractor License "
        "classifications C-27 / Class B, minimum insurance limits such as $2M CGL and Auto, DIR Public Works registration, "
        "prevailing wage requirements, bonding capacity, minimum years in business, mandatory past performance).\n"
        "3. Provide EXACT RFP citations (e.g., 'Section 2.3, Page 8') for every disqualifier item.\n"
        "4. Assign each disqualifier item an objective status:\n"
        "   - 'MET': Fully satisfied by verified evidence in the Company Vault.\n"
        "   - 'GAP': Requirement fails or exceeds contractor capacity (e.g. required $5M CGL when company only has $2M).\n"
        "   - 'VERIFY_MANUALLY': Minor administrative requirement requiring vendor confirmation or document execution prior to bid.\n"
        "5. DETERMINE VERDICT:\n"
        "   - 'GO': Contractor meets all mandatory criteria, licenses, insurance, and qualifications.\n"
        "   - 'CONDITIONAL GO': Contractor meets primary technical/licensing criteria, but needs standard action items "
        "     (e.g., adding City as additional insured, attending mandatory pre-bid meeting, or preparing custom bid bond).\n"
        "   - 'NO-GO': Fatal statutory defect (e.g., missing required CSLB classification, unfulfillable insurance, past deadline).\n"
        "6. SCORING RUBRIC: Extract all stated evaluation criteria categories with numerical weight percentages and recommended winning strategies.\n"
        "7. REQUIRED FORMS: List all required submittal forms, attachments, and non-collusion declarations.\n"
        "8. OUTPUT: Output ONLY a valid JSON object strictly complying with the ComplianceMatrix schema."
    )

    pdf_doc = Document.from_file(rfp_pdf_path)

    prompt = (
        f"Perform an exhaustive forensic compliance audit of the attached municipal RFP against the company vault.\n\n"
        f"VERIFIED COMPANY VAULT DATA:\n```json\n{vault_str}\n```\n\n"
        f"YOU MUST OUTPUT ONLY A VALID JSON OBJECT MATCHING THIS JSON SCHEMA:\n```json\n{schema_json}\n```\n"
        f"Do not include any conversational text or markdown explanation outside the JSON."
    )

    policies = [
        policy.deny("*"),
        policy.allow("load_company_vault")
    ]

    config = LocalAgentConfig(
        model=DEFAULT_MODEL,
        system_instructions=system_instructions,
        tools=[load_company_vault],
        policies=policies,
        response_schema=ComplianceMatrix,
        api_key=os.getenv("GEMINI_API_KEY")
    )

    async with Agent(config=config) as agent:
        response = await agent.chat([prompt, pdf_doc])
        structured = await response.structured_output()
        if not structured:
            raw_text = await response.text()
            structured = parse_json_from_text(raw_text)

        if not structured:
            raise ValueError("Failed to obtain structured ComplianceMatrix from shred_rfp agent")
        return ComplianceMatrix(**structured)

async def draft_bid_packet(
    rfp_pdf_path: str,
    compliance_matrix: ComplianceMatrix,
    vault_override: Optional[Dict[str, Any]] = None
) -> CompleteBidDraft:
    """
    Second Agent: Drafts a complete, rubric-aligned municipal proposal bid document
    based on the RFP and the audited ComplianceMatrix, strictly adhering to the Anti-Hallucination Invariant.
    """
    vault_str = json.dumps(vault_override, indent=2) if vault_override else load_company_vault()
    schema_json = json.dumps(CompleteBidDraft.model_json_schema(), indent=2)

    system_instructions = (
        "You are a master Municipal Proposal Writer specializing in high-win-rate public works and service bids for "
        "local small-business contractors (facilities, landscaping, grounds, and building maintenance).\n\n"
        "CRITICAL ANTI-HALLUCINATION INVARIANT:\n"
        "- You must ONLY cite licenses, insurance coverage limits, certifications, personnel names, EMR safety ratings, "
        "and past performance records EXPLICITLY VERIFIED in the Company Vault.\n"
        "- You must NEVER invent, assume, or hallucinate credentials, policy numbers, dollar values, or client references.\n"
        "- Any missing credential, unverified data, or requirement that cannot be confirmed from the company vault "
        "MUST be explicitly tagged with: [VENDOR ACTION REQUIRED: <specific item>].\n\n"
        "PROPOSAL ARCHITECTURE & DRAFTING STANDARDS:\n"
        "1. Executive Summary: High-impact, value-focused summary addressing the agency's goals, civic stewardship, "
        "local workforce advantage, and proven track record.\n"
        "2. Proposal Sections: Produce numbered sections directly addressing the RFP scope and scoring rubric:\n"
        "   - Section 1.0: Company Profile, Licensing & Qualifications (CSLB, DGS SB, DIR Registration).\n"
        "   - Section 2.0: Technical Methodology & Statement of Work Execution (daily/weekly task schedules, equipment, response times).\n"
        "   - Section 3.0: Key Personnel & Management Plan (Marcus Vance, Elena Rostova, David Chen, Maria Hernandez with verified roles).\n"
        "   - Section 4.0: Quality Control & Safety Program (IIPP, OSHA-30, EMR 0.78, zero lost-time record).\n"
        "   - Section 5.0: Verified Municipal Past Performance & References (City of Fremont, City of San Mateo with real contract metrics).\n"
        "   - Section 6.0: Compliance Matrix & Exceptions.\n"
        "3. Highlight specific [VENDOR ACTION REQUIRED: <item>] items wherever pricing, bid bonds, or specific city forms must be filled.\n"
        "4. Pricing Strategy Notes: Provide clear advice on certified prevailing wage (DIR eCPR), equipment capitalization, "
        "and small business preference points.\n"
        "5. Pre-Flight Submission Checklist: Step-by-step instructions for final packaging.\n"
        "6. OUTPUT: Output ONLY a valid JSON object strictly complying with the CompleteBidDraft schema."
    )

    pdf_doc = Document.from_file(rfp_pdf_path)
    matrix_json = compliance_matrix.model_dump_json(indent=2)

    prompt = (
        f"Draft a comprehensive, professional municipal proposal packet for the attached RFP.\n\n"
        f"AUDITED COMPLIANCE MATRIX:\n```json\n{matrix_json}\n```\n\n"
        f"VERIFIED COMPANY VAULT DATA:\n```json\n{vault_str}\n```\n\n"
        f"REMINDER: Maintain strict anti-hallucination fidelity. Use [VENDOR ACTION REQUIRED: <item>] for any "
        f"unverified evidence or required form execution.\n\n"
        f"YOU MUST OUTPUT ONLY A VALID JSON OBJECT MATCHING THIS JSON SCHEMA:\n```json\n{schema_json}\n```\n"
        f"Do not include any conversational text or markdown explanation outside the JSON."
    )

    policies = [
        policy.deny("*"),
        policy.allow("load_company_vault")
    ]

    config = LocalAgentConfig(
        model=DEFAULT_MODEL,
        system_instructions=system_instructions,
        tools=[load_company_vault],
        policies=policies,
        response_schema=CompleteBidDraft,
        api_key=os.getenv("GEMINI_API_KEY")
    )

    async with Agent(config=config) as agent:
        response = await agent.chat([prompt, pdf_doc])
        structured = await response.structured_output()
        if not structured:
            raw_text = await response.text()
            structured = parse_json_from_text(raw_text)

        if not structured:
            raise ValueError("Failed to obtain structured CompleteBidDraft from draft_bid_packet agent")
        return CompleteBidDraft(**structured)
