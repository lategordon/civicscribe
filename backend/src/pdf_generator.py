import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_sample_rfp_pdf(output_path: str = "input_rfps/sample_city_parks_rfp.pdf"):
    """Generates a realistic municipal RFP PDF document for testing CivicScribe."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1B365D'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#1B365D'),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # Header / Title
    story.append(Paragraph("CITY OF SAN LEANDRO", ParagraphStyle('SubHeader', fontName='Helvetica-Bold', fontSize=12, textColor=colors.HexColor('#475569'), spaceAfter=4)))
    story.append(Paragraph("DEPARTMENT OF PUBLIC WORKS", ParagraphStyle('SubHeader2', fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#64748B'), spaceAfter=8)))
    story.append(Paragraph("REQUEST FOR PROPOSALS (RFP #PW-2026-042)", title_style))
    story.append(Paragraph("<b>PROJECT TITLE:</b> Comprehensive Municipal Parks, Medians, and Public Facilities Grounds Maintenance Services", body_style))
    story.append(Spacer(1, 10))

    # Key Solicitation Milestones Table
    data_milestones = [
        [Paragraph("<b>Solicitation Event</b>", bold_body_style), Paragraph("<b>Date & Time / Location</b>", bold_body_style)],
        [Paragraph("RFP Release Date", body_style), Paragraph("November 4, 2026", body_style)],
        [Paragraph("Mandatory Pre-Bid Conference", bold_body_style), Paragraph("<b>November 24, 2026 at 10:00 AM PST</b><br/>City Hall Council Chambers, 835 E 14th St, San Leandro, CA 94577 (Attendance is strictly mandatory; tardiness by >10 minutes results in disqualification)", body_style)],
        [Paragraph("Vendor Questions Due", body_style), Paragraph("December 1, 2026 by 5:00 PM PST", body_style)],
        [Paragraph("City Addenda Issuance", body_style), Paragraph("December 5, 2026", body_style)],
        [Paragraph("Proposal Submission Deadline", bold_body_style), Paragraph("<b>December 15, 2026 at 2:00 PM PST (Strict Deadline)</b><br/>Submit one (1) original, three (3) copies, and one USB PDF copy to City Clerk's Office", body_style)],
        [Paragraph("Estimated Contract Period", body_style), Paragraph("Three (3) Year Base Term (July 1, 2027 - June 30, 2030) with two (2) optional 1-year renewals", body_style)],
        [Paragraph("Estimated Annual Value", body_style), Paragraph("$520,000 / year ($1,560,000 for 3-year base term)", body_style)]
    ]

    t_milestones = Table(data_milestones, colWidths=[180, 320])
    t_milestones.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1B365D')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_milestones)
    story.append(Spacer(1, 14))

    # SECTION 1: INVITATION AND SUMMARY
    story.append(Paragraph("SECTION 1: INVITATION AND SUMMARY OF WORK", h2_style))
    story.append(Paragraph(
        "The City of San Leandro invites competitive proposals from qualified, licensed commercial grounds maintenance "
        "and landscaping contractors to perform comprehensive maintenance services across 18 municipal public parks, 24 roadway "
        "medians, and 6 civic facility campuses. The Contractor shall furnish all labor, supervision, specialized equipment, "
        "supplies, materials, and incidentals required to deliver superior groundskeeping, turf care, smart irrigation management, "
        "tree trimming (up to 15 ft height), litter abatement, and 24/7 emergency storm response.",
        body_style
    ))

    # SECTION 2: MANDATORY MINIMUM CONTRACTOR QUALIFICATIONS (HARD DISQUALIFIERS)
    story.append(Paragraph("SECTION 2: MANDATORY MINIMUM CONTRACTOR QUALIFICATIONS", h2_style))
    story.append(Paragraph("Proposals failing to meet ANY of the following mandatory threshold requirements shall be deemed non-responsive and disqualified without technical evaluation:", body_style))

    data_disqualifiers = [
        [Paragraph("<b>Item</b>", bold_body_style), Paragraph("<b>Mandatory Qualification Requirement</b>", bold_body_style), Paragraph("<b>RFP Citation</b>", bold_body_style)],
        [Paragraph("1", body_style), Paragraph("<b>Contractor License:</b> Prime Contractor must hold an active California Contractors State License Board (CSLB) Class C-27 (Landscaping Contractor) or Class B license in good standing.", body_style), Paragraph("Section 2.1, Page 4", body_style)],
        [Paragraph("2", body_style), Paragraph("<b>Commercial General Liability:</b> Minimum coverage of $2,000,000 per occurrence and $4,000,000 general aggregate. City must be named as Additional Insured with Waiver of Subrogation.", body_style), Paragraph("Section 2.2, Page 4", body_style)],
        [Paragraph("3", body_style), Paragraph("<b>Automobile Liability:</b> Minimum combined single limit of $2,000,000 for all owned, hired, and non-owned vehicles.", body_style), Paragraph("Section 2.3, Page 5", body_style)],
        [Paragraph("4", body_style), Paragraph("<b>Workers' Compensation:</b> Statutory limits in compliance with California Labor Code §3700 with Employer's Liability of $1,000,000 and Waiver of Subrogation.", body_style), Paragraph("Section 2.4, Page 5", body_style)],
        [Paragraph("5", body_style), Paragraph("<b>DIR Public Works Registration:</b> Contractor and all tiers of subcontractors must be actively registered with the California Department of Industrial Relations (DIR) pursuant to Labor Code §1725.5 and submit Certified Payroll Records (eCPR).", body_style), Paragraph("Section 2.5, Page 6", body_style)],
        [Paragraph("6", body_style), Paragraph("<b>Mandatory Pre-Bid Attendance:</b> Contractor representative MUST attend the pre-bid meeting on November 24, 2026. Failure to attend results in immediate disqualification.", body_style), Paragraph("Section 2.6, Page 6", body_style)],
        [Paragraph("7", body_style), Paragraph("<b>Safety Record (EMR):</b> Three-year average Experience Modification Rate (EMR) must not exceed 1.00.", body_style), Paragraph("Section 2.7, Page 7", body_style)],
        [Paragraph("8", body_style), Paragraph("<b>Municipal Experience:</b> Minimum of two (2) verified municipal or government park maintenance contracts performed in California within the past five (5) years exceeding $300,000 annual value.", body_style), Paragraph("Section 2.8, Page 7", body_style)]
    ]

    t_disqualifiers = Table(data_disqualifiers, colWidths=[25, 375, 100])
    t_disqualifiers.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1B365D')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_disqualifiers)
    story.append(Spacer(1, 14))

    # SECTION 3: EVALUATION RUBRIC AND SCORING CRITERIA
    story.append(Paragraph("SECTION 3: EVALUATION CRITERIA & SCORING RUBRIC", h2_style))
    story.append(Paragraph("A City Evaluation Committee will score responsive proposals based on a 100-point rubric:", body_style))

    data_rubric = [
        [Paragraph("<b>Scoring Category</b>", bold_body_style), Paragraph("<b>Weight</b>", bold_body_style), Paragraph("<b>Evaluation Criteria Description</b>", bold_body_style)],
        [Paragraph("Technical Approach & Maintenance Plan", body_style), Paragraph("30%", bold_body_style), Paragraph("Quality of proposed maintenance methodology, turf care, smart WeatherTRAK irrigation management, integrated pest management (IPM), equipment allocation, and emergency response.", body_style)],
        [Paragraph("Qualifications & Key Personnel", body_style), Paragraph("25%", bold_body_style), Paragraph("Experience of proposed Project Manager, Field Superintendent, Arborist, and certified chemical applicator licenses.", body_style)],
        [Paragraph("Past Performance & References", body_style), Paragraph("25%", bold_body_style), Paragraph("Demonstrated reliability, SLA compliance, client satisfaction ratings on comparable California public works contracts.", body_style)],
        [Paragraph("Fee Proposal & Cost Competitiveness", body_style), Paragraph("15%", bold_body_style), Paragraph("Reasonableness of monthly base fees, prevailing wage compliance schedule, and equipment hourly rate sheet.", body_style)],
        [Paragraph("Local / Small Business Preference", body_style), Paragraph("5%", bold_body_style), Paragraph("Preference awarded to California DGS Certified Small Businesses (SB/Micro) or Alameda County local vendors.", body_style)]
    ]

    t_rubric = Table(data_rubric, colWidths=[150, 60, 290])
    t_rubric.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_rubric)
    story.append(Spacer(1, 14))

    # SECTION 4: REQUIRED SUBMITTALS
    story.append(Paragraph("SECTION 4: PROPOSAL SUBMITTAL CHECKLIST", h2_style))
    story.append(Paragraph("All proposals must be structured into the following numbered sections and include executed exhibits:", body_style))
    story.append(Paragraph("• <b>Cover Letter & Executive Summary</b> signed by authorized corporate officer.", body_style))
    story.append(Paragraph("• <b>Section 1: Company Profile & Licensing</b> (CSLB certificate, DGS Small Business certification, DIR registration).", body_style))
    story.append(Paragraph("• <b>Section 2: Technical Methodology & Work Plan</b> (daily/weekly task schedule, water conservation plan).", body_style))
    story.append(Paragraph("• <b>Section 3: Staffing & Key Personnel Resumes</b> (Principal, Superintendent, Safety Officer).", body_style))
    story.append(Paragraph("• <b>Section 4: Safety Record & IIPP</b> (OSHA 300 logs, current EMR letter from insurance carrier).", body_style))
    story.append(Paragraph("• <b>Section 5: Municipal Past Performance & References</b> (at least 2 contracts with contact details).", body_style))
    story.append(Paragraph("• <b>Exhibit A: Non-Collusion Declaration</b> (executed under penalty of perjury).", body_style))
    story.append(Paragraph("• <b>Exhibit B: Worker's Compensation & DIR Prevailing Wage Certification</b>.", body_style))
    story.append(Paragraph("• <b>Exhibit C: Sealed Fee Schedule & Rate Schedule</b>.", body_style))

    doc.build(story)
    print(f"Sample RFP PDF successfully generated at: {output_path}")

if __name__ == "__main__":
    create_sample_rfp_pdf()
