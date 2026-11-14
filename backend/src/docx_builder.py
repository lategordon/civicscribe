import os
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from .schemas import ComplianceMatrix, CompleteBidDraft

NAVY_HEX = "1B365D"
SLATE_HEX = "475569"
EMERALD_HEX = "059669"
AMBER_HEX = "D97706"
RED_HEX = "DC2626"
LIGHT_BG_HEX = "F1F5F9"
BORDER_HEX = "CBD5E1"

def set_cell_background(cell, hex_color: str):
    """Sets background shading color for a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets padding/margins for a table cell."""
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for name, value in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(name)
        node.set(qn('w:w'), str(value))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def generate_docx_proposal(
    matrix: ComplianceMatrix,
    draft: CompleteBidDraft,
    output_dir: str = "output_bids",
    company_name: str = "Bay Vista Municipal Grounds & Facilities, Inc."
) -> str:
    """
    Compiles ComplianceMatrix and CompleteBidDraft into a polished,
    submission-ready municipal proposal packet .docx file.
    """
    os.makedirs(output_dir, exist_ok=True)
    doc = Document()

    # Set page margins (0.75 in)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # ------------------ COVER / TITLE BANNER ------------------
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_agency = title_p.add_run(f"{matrix.agency.upper()}\n")
    run_agency.font.size = Pt(11)
    run_agency.font.bold = True
    run_agency.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    run_title = title_p.add_run(draft.proposal_title)
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run(f"Solicitation #{matrix.solicitation_number} | Due Date: {matrix.submission_deadline}")
    run_sub.font.size = Pt(10)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # ------------------ VENDOR IDENTIFICATION TABLE ------------------
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_data = [
        ("Prime Contractor / Vendor", company_name),
        ("Issuing Municipality", matrix.agency),
        ("Pre-Bid Meeting Requirement", "Mandatory" if matrix.mandatory_pre_bid_meeting else "Non-Mandatory / Optional"),
        ("Compliance Audit Verdict", matrix.verdict)
    ]

    for idx, (lbl, val) in enumerate(meta_data):
        row = idx // 2
        col = idx % 2
        cell = meta_table.cell(row, col)
        set_cell_background(cell, LIGHT_BG_HEX)
        set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r_lbl = p.add_run(f"{lbl}: ")
        r_lbl.font.bold = True
        r_lbl.font.size = Pt(9.5)
        r_lbl.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
        r_val = p.add_run(val)
        r_val.font.size = Pt(9.5)
        if lbl == "Compliance Audit Verdict":
            r_val.font.bold = True
            if val == "GO":
                r_val.font.color.rgb = RGBColor(0x05, 0x96, 0x69)
            elif val == "CONDITIONAL GO":
                r_val.font.color.rgb = RGBColor(0xD9, 0x77, 0x06)
            else:
                r_val.font.color.rgb = RGBColor(0xDC, 0x26, 0x26)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ------------------ PART I: COMPLIANCE AUDIT MATRIX ------------------
    part1_heading = doc.add_paragraph()
    p1_run = part1_heading.add_run("PART I: COMPLIANCE AUDIT & GO/NO-GO EVALUATION")
    p1_run.font.size = Pt(13)
    p1_run.font.bold = True
    p1_run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
    part1_heading.paragraph_format.space_before = Pt(10)
    part1_heading.paragraph_format.space_after = Pt(4)

    # Verdict Rationale Box
    rat_p = doc.add_paragraph()
    rat_p.paragraph_format.space_before = Pt(2)
    rat_p.paragraph_format.space_after = Pt(10)
    r_head = rat_p.add_run("Audit Verdict Rationale: ")
    r_head.font.bold = True
    r_head.font.size = Pt(10)
    r_text = rat_p.add_run(matrix.verdict_rationale)
    r_text.font.size = Pt(10)

    # Hard Disqualifiers Table
    if matrix.disqualifiers:
        dq_p = doc.add_paragraph()
        dq_run = dq_p.add_run("1. Mandatory Hard Disqualifiers Assessment")
        dq_run.font.size = Pt(11)
        dq_run.font.bold = True
        dq_p.paragraph_format.space_after = Pt(4)

        table = doc.add_table(rows=1, cols=4)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        headers = ["Criterion / Requirement", "RFP Citation", "Vault Verification", "Status"]
        col_widths = [Inches(2.2), Inches(1.2), Inches(2.6), Inches(1.0)]

        hdr_row = table.rows[0]
        for i, h_text in enumerate(headers):
            cell = hdr_row.cells[i]
            set_cell_background(cell, NAVY_HEX)
            set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
            p = cell.paragraphs[0]
            run = p.add_run(h_text)
            run.font.bold = True
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for item in matrix.disqualifiers:
            row_cells = table.add_row().cells
            row_cells[0].paragraphs[0].add_run(f"{item.criterion}\n{item.requirement_summary}").font.size = Pt(8.5)
            row_cells[1].paragraphs[0].add_run(item.rfp_citation).font.size = Pt(8.5)
            row_cells[2].paragraphs[0].add_run(f"{item.vault_verification}").font.size = Pt(8.5)

            st_p = row_cells[3].paragraphs[0]
            st_run = st_p.add_run(item.status)
            st_run.font.bold = True
            st_run.font.size = Pt(8.5)
            if item.status == "MET":
                set_cell_background(row_cells[3], "ECFDF5")
                st_run.font.color.rgb = RGBColor(0x05, 0x96, 0x69)
            elif item.status == "GAP":
                set_cell_background(row_cells[3], "FEF2F2")
                st_run.font.color.rgb = RGBColor(0xDC, 0x26, 0x26)
            else:
                set_cell_background(row_cells[3], "FFFBEB")
                st_run.font.color.rgb = RGBColor(0xD9, 0x77, 0x06)

            for c in row_cells:
                set_cell_margins(c, top=80, bottom=80, left=80, right=80)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Evaluation Rubric Table
    if matrix.evaluation_rubric:
        rb_p = doc.add_paragraph()
        rb_run = rb_p.add_run("2. Scoring Rubric & Weighted Allocation")
        rb_run.font.size = Pt(11)
        rb_run.font.bold = True
        rb_p.paragraph_format.space_after = Pt(4)

        rtable = doc.add_table(rows=1, cols=3)
        rtable.alignment = WD_TABLE_ALIGNMENT.CENTER
        r_headers = ["Evaluation Category", "Weight", "Recommended Winning Strategy"]

        for i, h_text in enumerate(r_headers):
            cell = rtable.rows[0].cells[i]
            set_cell_background(cell, NAVY_HEX)
            set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
            p = cell.paragraphs[0]
            run = p.add_run(h_text)
            run.font.bold = True
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        for item in matrix.evaluation_rubric:
            row_cells = rtable.add_row().cells
            row_cells[0].paragraphs[0].add_run(item.category).font.size = Pt(8.5)
            row_cells[1].paragraphs[0].add_run(f"{item.weight_percentage:.0f}%").font.size = Pt(8.5)
            row_cells[2].paragraphs[0].add_run(item.recommended_strategy).font.size = Pt(8.5)
            for c in row_cells:
                set_cell_margins(c, top=80, bottom=80, left=80, right=80)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ------------------ PART II: FORMAL PROPOSAL BID DRAFT ------------------
    doc.add_page_break()
    part2_heading = doc.add_paragraph()
    p2_run = part2_heading.add_run("PART II: COMPLETE TECHNICAL & MANAGEMENT PROPOSAL")
    p2_run.font.size = Pt(14)
    p2_run.font.bold = True
    p2_run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
    part2_heading.paragraph_format.space_after = Pt(8)

    # Executive Summary
    es_h = doc.add_paragraph()
    es_run = es_h.add_run("Executive Summary")
    es_run.font.size = Pt(12)
    es_run.font.bold = True
    es_run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
    es_h.paragraph_format.space_before = Pt(6)
    es_h.paragraph_format.space_after = Pt(4)

    for para_text in draft.executive_summary.split("\n\n"):
        if para_text.strip():
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15
            p.add_run(para_text.strip()).font.size = Pt(10)

    # Numbered Narrative Sections
    for sec in draft.sections:
        sh = doc.add_paragraph()
        sh.paragraph_format.space_before = Pt(10)
        sh.paragraph_format.space_after = Pt(4)
        run_sec = sh.add_run(f"{sec.section_number} {sec.title}")
        run_sec.font.size = Pt(12)
        run_sec.font.bold = True
        run_sec.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

        if sec.addressed_rubric_category:
            cat_p = doc.add_paragraph()
            cat_p.paragraph_format.space_after = Pt(4)
            cat_run = cat_p.add_run(f"[Addressed Rubric Criterion: {sec.addressed_rubric_category}]")
            cat_run.font.size = Pt(8.5)
            cat_run.font.italic = True
            cat_run.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

        # Split section content into paragraphs
        paragraphs = sec.content.split("\n\n")
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # Check if this paragraph contains a VENDOR ACTION REQUIRED tag
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15

            if "[VENDOR ACTION REQUIRED:" in para:
                # Add highlighting/callout
                run = p.add_run(para)
                run.font.size = Pt(10)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xD9, 0x77, 0x06)
            elif para.startswith("- ") or para.startswith("* "):
                p.paragraph_format.left_indent = Inches(0.25)
                run = p.add_run("• " + para[2:])
                run.font.size = Pt(9.5)
            elif para.startswith("### "):
                run = p.add_run(para[4:])
                run.font.size = Pt(10.5)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
            else:
                run = p.add_run(para)
                run.font.size = Pt(10)

        # Render vendor action callout block if specific items exist
        if sec.vendor_action_required:
            va_table = doc.add_table(rows=1, cols=1)
            va_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            va_cell = va_table.cell(0, 0)
            set_cell_background(va_cell, "FFFBEB")  # Light amber
            set_cell_margins(va_cell, top=100, bottom=100, left=150, right=150)
            vp = va_cell.paragraphs[0]
            v_title = vp.add_run("ACTION REQUIRED BY CONTRACTOR BEFORE SUBMISSION:\n")
            v_title.font.bold = True
            v_title.font.size = Pt(9)
            v_title.font.color.rgb = RGBColor(0xD9, 0x77, 0x06)
            for item in sec.vendor_action_required:
                v_item = vp.add_run(f"• {item}\n")
                v_item.font.size = Pt(8.5)
                v_item.font.color.rgb = RGBColor(0x92, 0x40, 0x0E)
            doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ------------------ PART III: PRICING STRATEGY & DIR COMPLIANCE ------------------
    doc.add_page_break()
    p3_h = doc.add_paragraph()
    p3_run = p3_h.add_run("PART III: PRICING STRATEGY & REGULATORY COMPLIANCE")
    p3_run.font.size = Pt(13)
    p3_run.font.bold = True
    p3_run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
    p3_h.paragraph_format.space_before = Pt(8)
    p3_h.paragraph_format.space_after = Pt(4)

    price_p = doc.add_paragraph()
    price_p.paragraph_format.space_after = Pt(6)
    price_p.paragraph_format.line_spacing = 1.15
    price_p.add_run(draft.pricing_strategy_notes).font.size = Pt(10)

    # Submission Pre-Flight Checklist
    if draft.submission_checklist:
        ck_h = doc.add_paragraph()
        ck_h.paragraph_format.space_before = Pt(8)
        ck_h.paragraph_format.space_after = Pt(4)
        ck_run = ck_h.add_run("Pre-Flight Submission Checklist")
        ck_run.font.size = Pt(11)
        ck_run.font.bold = True
        ck_run.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

        for chk in draft.submission_checklist:
            cp = doc.add_paragraph()
            cp.paragraph_format.left_indent = Inches(0.25)
            cp.paragraph_format.space_after = Pt(3)
            c_run = cp.add_run(f"□ {chk}")
            c_run.font.size = Pt(9.5)

    # Clean file name from solicitation number
    safe_sol = "".join([c if c.isalnum() or c in "-_" else "_" for c in matrix.solicitation_number])
    filename = f"Proposal_Packet_{safe_sol}.docx"
    output_path = os.path.join(output_dir, filename)
    doc.save(output_path)
    return filename
