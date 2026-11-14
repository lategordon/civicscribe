export type VerdictType = "GO" | "CONDITIONAL GO" | "NO-GO";
export type ComplianceStatusType = "MET" | "GAP" | "VERIFY_MANUALLY";

export interface DisqualifierItem {
  criterion: string;
  requirement_summary: string;
  rfp_citation: string;
  status: ComplianceStatusType;
  vault_verification: string;
  notes?: string;
}

export interface RubricItem {
  category: string;
  weight_percentage: number;
  description: string;
  recommended_strategy: string;
}

export interface RequiredFormItem {
  form_name: string;
  mandatory: boolean;
  description: string;
  submittal_instructions: string;
}

export interface ComplianceMatrix {
  solicitation_number: string;
  agency: string;
  title: string;
  submission_deadline: string;
  mandatory_pre_bid_meeting: boolean;
  pre_bid_meeting_details?: string;
  verdict: VerdictType;
  verdict_rationale: string;
  disqualifiers: DisqualifierItem[];
  evaluation_rubric: RubricItem[];
  required_forms: RequiredFormItem[];
  estimated_contract_value?: string;
  contract_period?: string;
  summary_notes?: string;
}

export interface ProposalSection {
  section_number: string;
  title: string;
  content: string;
  addressed_rubric_category?: string;
  vendor_action_required: string[];
}

export interface CompleteBidDraft {
  proposal_title: string;
  solicitation_number: string;
  agency: string;
  executive_summary: string;
  sections: ProposalSection[];
  missing_evidence_flags: string[];
  pricing_strategy_notes: string;
  submission_checklist: string[];
}

export interface AnalyzeRFPResponse {
  success: boolean;
  compliance_matrix: ComplianceMatrix;
  bid_draft: CompleteBidDraft;
  docx_filename: string;
  download_url: string;
  execution_time_seconds: number;
  message: string;
}

export interface CompanyVault {
  company_name: string;
  dba: string;
  fein: string;
  cage_code: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    county: string;
  };
  contact: {
    primary_contact_name: string;
    title: string;
    email: string;
    phone: string;
    website: string;
  };
  business_structure: {
    entity_type: string;
    year_established: number;
    years_in_business: number;
    union_status: string;
  };
  licenses: Array<{
    type: string;
    license_number: string;
    classifications: string[];
    status: string;
    qualifying_individual: string;
    expiration_date: string;
  }>;
  certifications: Array<{
    title: string;
    cert_number: string;
    issuing_agency: string;
    valid_through: string;
    eligible_for_sb_preference: boolean;
  }>;
  public_works_registration: {
    dir_number: string;
    agency: string;
    status: string;
    certified_payroll_system: string;
    expiration_date: string;
  };
  insurance: {
    commercial_general_liability: {
      carrier: string;
      policy_number: string;
      each_occurrence_limit: string;
      general_aggregate_limit: string;
      products_completed_operations_aggregate: string;
      additional_insured_endorsement_form: string;
      primary_non_contributory: boolean;
      waiver_of_subrogation: boolean;
      expiration_date: string;
    };
    automobile_liability: {
      carrier: string;
      policy_number: string;
      combined_single_limit: string;
      coverage_applies_to: string;
      expiration_date: string;
    };
    workers_compensation: {
      carrier: string;
      policy_number: string;
      statutory_limits: boolean;
      employers_liability_each_accident: string;
      employers_liability_disease_policy_limit: string;
      employers_liability_disease_each_employee: string;
      waiver_of_subrogation: boolean;
      expiration_date: string;
    };
    umbrella_excess_liability: {
      carrier: string;
      policy_number: string;
      each_occurrence_limit: string;
      aggregate_limit: string;
      expiration_date: string;
    };
  };
  bonding: {
    surety_company: string;
    broker: string;
    single_project_bonding_capacity: string;
    aggregate_bonding_capacity: string;
    current_available_capacity: string;
    can_issue_bid_bond_p_and_p: boolean;
  };
  key_personnel: Array<{
    name: string;
    role: string;
    experience_years: number;
    certifications: string[];
    bio: string;
  }>;
  safety_metrics: {
    experience_modification_rate_emr: string;
    three_year_average_emr: string;
    lost_workday_incident_rate_lwir: string;
    osha_recordables_past_3_years: number;
    has_written_iipp: boolean;
    has_tailgate_safety_meetings_weekly: boolean;
  };
  municipal_past_performance: Array<{
    contract_name: string;
    solicitation_number: string;
    agency: string;
    contract_term: string;
    annual_contract_value: string;
    total_value: string;
    scope_of_work: string;
    key_outcomes: string;
    client_reference: {
      name: string;
      title: string;
      phone: string;
      email: string;
    };
  }>;
}


// --- Proactive Portal Monitor Frontend Types ---

export interface MonitoredPortal {
  id: string;
  name: string;
  jurisdiction: string;
  portal_url: string;
  target_trades: string[];
  check_interval_minutes: number;
  last_checked_at?: string;
  status: "active" | "paused" | "error";
  solicitations_count: number;
  created_at: string;
}

export interface AddPortalRequest {
  name: string;
  jurisdiction: string;
  portal_url: string;
  target_trades: string[];
  check_interval_minutes: number;
}

export interface ChangeHistoryItem {
  timestamp: string;
  change_type: "NEW_POSTING" | "ADDENDUM" | "DEADLINE_EXTENDED" | "NONE";
  summary: string;
}

export interface DiscoveredSolicitation {
  id: string;
  portal_id: string;
  solicitation_number: string;
  title: string;
  agency: string;
  trade_category: string;
  estimated_value?: string;
  submission_deadline: string;
  status: "NEW" | "ADDENDUM_POSTED" | "DEADLINE_EXTENDED" | "ACTIVE" | "ARCHIVED";
  latest_change_type?: "NEW_POSTING" | "ADDENDUM" | "DEADLINE_EXTENDED" | "NONE";
  latest_change_summary?: string;
  change_history: ChangeHistoryItem[];
  source_url: string;
  pdf_path?: string;
  compliance_verdict?: "UNAUDITED" | "GO" | "CONDITIONAL GO" | "NO-GO";
  first_detected_at: string;
  last_updated_at: string;
  portal_name?: string;
  jurisdiction?: string;
}

export interface MonitorOverview {
  active_portals_count: number;
  total_solicitations_count: number;
  recent_changes_count: number;
  go_opportunities_count: number;
  last_monitored_at: string;
}

export interface DetectedEventItem {
  solicitation_number: string;
  title: string;
  agency: string;
  change_type: string;
  summary: string;
  timestamp: string;
}

export interface ScanPortalsResponse {
  success: boolean;
  scanned_at: string;
  portals_scanned: number;
  changes_detected_count: number;
  detected_events: DetectedEventItem[];
  overview: MonitorOverview;
  message: string;
}
