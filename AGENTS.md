# CivicScribe: Architectural Rules & Invariants

## 1. Project Overview & Scope
CivicScribe is an AI Municipal RFP Compliance Auditor and Proposal Bid Writer designed for local small-business service contractors (janitorial, landscaping, HVAC, and facility maintenance). It parses municipal RFPs (Requests for Proposals), audits them against company qualifications, produces an objective Go/No-Go compliance matrix, and drafts rubric-aligned submission-ready proposal bid documents.

## 2. Technology Stack & Architectural Constraints

### Backend Requirements
- **Runtime**: Python 3.11+
- **API Framework**: FastAPI with standard CORS middleware enabled for frontend integration.
- **Data Validation & Schemas**: Pydantic v2 for all request/response models and agent response schemas.
- **Document Generation**: `python-docx` for producing professional, formatted `.docx` bid packages.
- **AI Agent Framework**: `google-antigravity` SDK:
  - Agent instantiation using `Agent` and `LocalAgentConfig`.
  - Document ingestion via `Document.from_file()` for direct PDF processing.
  - Strict structured outputs using `response_schema` bound to Pydantic models.
  - Strict safety policies: Read-only access locked down with `policy.deny("*")` and explicit tool allowlisting `policy.allow("load_company_vault")`.
  - Multi-agent orchestration:
    1. `shred_rfp`: Analyzes RFP requirements, extracts criteria, builds `ComplianceMatrix`, flags hard disqualifiers, and outputs Go/Conditional Go/No-Go verdict.
    2. `draft_bid_packet`: References the audited compliance matrix and verified company vault to draft full narrative proposal sections.

### Frontend Requirements
- **Framework**: Next.js (App Router), TypeScript, Tailwind CSS.
- **Visual Design & Civic Aesthetic**:
  - Primary Civic Color: Deep Navy (`#1B365D`)
  - Neutral Secondary: Slate Gray (`#475569` / `#64748B`)
  - Background & Cards: Clean light background with crisp white elevated cards and borders.
  - Status Indicators: Emerald (`#059669` / `#10B981`) for `GO` / `MET`, Amber (`#D97706` / `#F59E0B`) for `CONDITIONAL GO` / `VERIFY_MANUALLY`, Red (`#DC2626` / `#EF4444`) for `NO-GO` / `GAP`.
- **UI Structure**:
  - **Tab 1: New RFP Audit & Bid Generator** with drag-and-drop PDF upload and live stepped progress.
  - **Tab 2: Go/No-Go Scorecard & Draft Preview** with verdict banner, disqualifier table, rubric breakdown, section preview, highlighted action items, and `.docx` download action.
  - **Tab 3: Company Vault Manager** with structured form controls to inspect and update vendor credentials, licenses, insurance, and past performance.

## 3. Core Anti-Hallucination Invariant
> [!IMPORTANT]
> The proposal-writing agent must **ONLY** cite licenses, insurance coverage limits, personnel certifications, and past performance records explicitly verified in the Company Vault (`vault/company_profile.json`). Any missing credential, unverified claim, or unknown requirement must **NEVER** be fabricated; it must be explicitly flagged with:
> `[VENDOR ACTION REQUIRED: <specific item>]`
