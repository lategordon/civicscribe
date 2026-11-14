# CivicScribe

> **AI Municipal RFP Compliance Auditor & Proposal Bid Writer for Local Contractors**

CivicScribe is an AI-powered municipal GovTech platform engineered specifically for local small-business service contractors (janitorial, landscaping, HVAC, and facilities maintenance). It parses municipal RFPs (Requests for Proposals), audits them against verified company qualifications, produces an objective Go/No-Go compliance matrix, and drafts rubric-aligned, submission-ready proposal bid packages (`.docx`).

---

## Key Features

- **Forensic RFP Shredding:** Deconstructs municipal solicitations, extracting statutory disqualifiers, licensing thresholds (e.g. CSLB C-27), DIR public works requirements, and scoring rubrics.
- **Strict Anti-Hallucination Guardrails:** Bound directly to the contractor's verified **Company Vault** (`vault/company_profile.json`). Never fabricates past projects, insurance limits, or certifications—flagging any gaps with explicit `[VENDOR ACTION REQUIRED]` markers.
- **Go / No-Go Compliance Matrix:** Immediate high-contrast evaluation of fatal gaps vs. verified qualifications.
- **Rubric Optimization:** Strategically maps proposal sections against municipal evaluation criteria and point weights.
- **Submission-Ready Word Packages:** Generates structured Microsoft Word (`.docx`) bid packets with transmittal letters, executive summaries, technical approaches, and compliance tables.

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, Pydantic v2, `python-docx`, `google-antigravity` SDK.
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons.

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add your GEMINI_API_KEY
python -m uvicorn src.api:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
