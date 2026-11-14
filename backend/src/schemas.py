from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# Verdict and compliance status types
VerdictType = Literal["GO", "CONDITIONAL GO", "NO-GO"]
ComplianceStatusType = Literal["MET", "GAP", "VERIFY_MANUALLY"]

class DisqualifierItem(BaseModel):
    criterion: str = Field(..., description="Name of the disqualifier criterion, e.g., 'CSLB C-27 Contractor License'")
    requirement_summary: str = Field(..., description="Summary of the requirement stated in the RFP")
    rfp_citation: str = Field(..., description="Exact RFP citation where this requirement appears, e.g. 'Section 2.4, Page 8'")
    status: ComplianceStatusType = Field(..., description="Compliance status against verified vendor profile")
    vault_verification: str = Field(..., description="Exact evidence found or confirmed absent from Company Vault")
    notes: Optional[str] = Field(default="", description="Additional legal or operational notes")

class RubricItem(BaseModel):
    category: str = Field(..., description="Evaluation category name, e.g., 'Technical Approach & Methodology'")
    weight_percentage: float = Field(..., description="Weight in percent (0-100), e.g. 30.0")
    description: str = Field(..., description="Description of criteria evaluated in this category")
    recommended_strategy: str = Field(..., description="Actionable bidding advice to maximize points")

class RequiredFormItem(BaseModel):
    form_name: str = Field(..., description="Name or title of required submittal document/form")
    mandatory: bool = Field(default=True, description="Whether omission causes bid rejection")
    description: str = Field(..., description="Brief description of the form's purpose")
    submittal_instructions: str = Field(..., description="Where and how to submit, e.g. 'Exhibit C, Envelope #1'")

class ComplianceMatrix(BaseModel):
    solicitation_number: str = Field(..., description="RFP / Solicitation Number from the municipal agency")
    agency: str = Field(..., description="Name of the issuing public agency or municipality")
    title: str = Field(..., description="Full solicitation title")
    submission_deadline: str = Field(..., description="Date and time proposals are strictly due")
    mandatory_pre_bid_meeting: bool = Field(..., description="True if attendance is mandatory to bid")
    pre_bid_meeting_details: Optional[str] = Field(default="", description="Date, time, location or conference link if applicable")
    verdict: VerdictType = Field(..., description="Objective assessment: GO, CONDITIONAL GO, or NO-GO")
    verdict_rationale: str = Field(..., description="Clear executive summary justifying the verdict")
    disqualifiers: List[DisqualifierItem] = Field(default_factory=list, description="Audit of all hard mandatory requirements")
    evaluation_rubric: List[RubricItem] = Field(default_factory=list, description="Scoring criteria and weight breakdown")
    required_forms: List[RequiredFormItem] = Field(default_factory=list, description="Checklist of required forms and exhibits")
    estimated_contract_value: Optional[str] = Field(default="", description="Budget or estimated contract size if specified")
    contract_period: Optional[str] = Field(default="", description="Base term and option years")
    summary_notes: Optional[str] = Field(default="", description="Key operational or strategic observations")

class ProposalSection(BaseModel):
    section_number: str = Field(..., description="Section number matching RFP outline, e.g. '1.0', '2.1'")
    title: str = Field(..., description="Section title")
    content: str = Field(..., description="Full drafted narrative text formatted with Markdown")
    addressed_rubric_category: Optional[str] = Field(default="", description="Which evaluation rubric category this section directly addresses")
    vendor_action_required: List[str] = Field(
        default_factory=list,
        description="List of specific vendor action items flagged with [VENDOR ACTION REQUIRED: ...] due to missing vault evidence"
    )

class CompleteBidDraft(BaseModel):
    proposal_title: str = Field(..., description="Title of the final bid proposal document")
    solicitation_number: str = Field(..., description="Solicitation number")
    agency: str = Field(..., description="Issuing agency")
    executive_summary: str = Field(..., description="Compelling 2-3 paragraph executive summary")
    sections: List[ProposalSection] = Field(default_factory=list, description="Numbered narrative sections matching RFP outline")
    missing_evidence_flags: List[str] = Field(
        default_factory=list,
        description="Consolidated list of all [VENDOR ACTION REQUIRED: <item>] callouts across the entire draft"
    )
    pricing_strategy_notes: str = Field(..., description="Strategic recommendations for fee proposal, prevailing wage, and small business preference")
    submission_checklist: List[str] = Field(default_factory=list, description="Step-by-step pre-flight checklist before submission")

class AnalyzeRFPResponse(BaseModel):
    success: bool
    compliance_matrix: ComplianceMatrix
    bid_draft: CompleteBidDraft
    docx_filename: str
    download_url: str
    execution_time_seconds: float
    message: str


# --- Proactive Portal Monitor Models ---

class MonitoredPortal(BaseModel):
    id: str
    name: str
    jurisdiction: str
    portal_url: str
    target_trades: List[str]
    check_interval_minutes: int
    last_checked_at: Optional[str] = None
    status: str
    solicitations_count: int
    created_at: str

class AddPortalRequest(BaseModel):
    name: str
    jurisdiction: str
    portal_url: str
    target_trades: List[str]
    check_interval_minutes: int = 60

class ChangeHistoryItem(BaseModel):
    timestamp: str
    change_type: str
    summary: str

class DiscoveredSolicitation(BaseModel):
    id: str
    portal_id: str
    solicitation_number: str
    title: str
    agency: str
    trade_category: str
    estimated_value: Optional[str] = ""
    submission_deadline: str
    status: str
    latest_change_type: Optional[str] = "NONE"
    latest_change_summary: Optional[str] = ""
    change_history: List[ChangeHistoryItem] = Field(default_factory=list)
    source_url: str
    pdf_path: Optional[str] = ""
    compliance_verdict: Optional[str] = "UNAUDITED"
    first_detected_at: str
    last_updated_at: str
    portal_name: Optional[str] = ""
    jurisdiction: Optional[str] = ""

class MonitorOverview(BaseModel):
    active_portals_count: int
    total_solicitations_count: int
    recent_changes_count: int
    go_opportunities_count: int
    last_monitored_at: str

class DetectedEventItem(BaseModel):
    solicitation_number: str
    title: str
    agency: str
    change_type: str
    summary: str
    timestamp: str

class ScanPortalsResponse(BaseModel):
    success: bool
    scanned_at: str
    portals_scanned: int
    changes_detected_count: int
    detected_events: List[DetectedEventItem]
    overview: MonitorOverview
    message: str
