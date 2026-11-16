import sys
import os
import re
import subprocess

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

try:
    import reportlab
except ImportError:
    install("reportlab")

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle, Preformatted, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def markdown_to_pdf(md_file_path, pdf_file_path):
    with open(md_file_path, "r", encoding="utf-8") as f:
        content = f.read()

    doc = SimpleDocTemplate(
        pdf_file_path,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Academic Typography Styles (IEEE / Traditional Paper Format)
    title_style = ParagraphStyle(
        'PaperTitle',
        parent=styles['Heading1'],
        fontName='Times-Bold',
        fontSize=20,
        leading=24,
        alignment=1, # Center
        spaceAfter=15,
        textColor=colors.black
    )

    meta_style = ParagraphStyle(
        'PaperMeta',
        parent=styles['Normal'],
        fontName='Times-Italic',
        fontSize=11,
        leading=16,
        alignment=1,
        spaceAfter=20,
        textColor=colors.HexColor('#333333')
    )

    h1_style = ParagraphStyle(
        'PaperH1',
        parent=styles['Heading1'],
        fontName='Times-Bold',
        fontSize=14,
        leading=18,
        spaceBefore=18,
        spaceAfter=6,
        textColor=colors.black,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'PaperH2',
        parent=styles['Heading2'],
        fontName='Times-Bold',
        fontSize=12.5,
        leading=16,
        spaceBefore=12,
        spaceAfter=6,
        textColor=colors.black,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'PaperBody',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=12,
        leading=18, # 1.5 spacing
        spaceAfter=8,
        alignment=4 # Justified
    )

    bullet_style = ParagraphStyle(
        'PaperBullet',
        parent=body_style,
        leftIndent=20,
        firstLineIndent=-12,
        spaceAfter=6,
        alignment=0 # Left
    )

    code_style = ParagraphStyle(
        'PaperCode',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        backColor=colors.HexColor('#F8F9FA'),
        borderColor=colors.HexColor('#E9ECEF'),
        borderWidth=0.5,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=8
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Times-Roman',
        fontSize=10,
        leading=13
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Times-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.white
    )


    story = []
    lines = content.split('\n')
    
    in_yaml = False
    in_code_block = False
    code_lines = []
    table_lines = []

    def flush_table(table_lines):
        if not table_lines:
            return None
        parsed_rows = []
        is_header = True
        for row in table_lines:
            if re.match(r'^\s*\|?\s*:?-+:?\s*\|', row):
                continue # Skip alignment row
            cells = [c.strip() for c in row.strip('|').split('|')]
            formatted_cells = []
            for cell in cells:
                c_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', cell)
                c_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', c_text)
                if is_header:
                    formatted_cells.append(Paragraph(c_text, table_header_style))
                else:
                    formatted_cells.append(Paragraph(c_text, table_cell_style))
            parsed_rows.append(formatted_cells)
            is_header = False
        
        if parsed_rows:
            t = Table(parsed_rows, repeatRows=1)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0D47A1')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D6D6D6')),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9F9F9')])
            ]))
            return t
        return None

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Handle YAML frontmatter
        if stripped == '---':
            in_yaml = not in_yaml
            i += 1
            continue
        if in_yaml:
            i += 1
            continue

        # Handle Code Blocks
        if stripped.startswith('```'):
            if in_code_block:
                code_text = '\n'.join(code_lines)
                story.append(Preformatted(code_text, code_style))
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Handle Tables
        if stripped.startswith('|') and stripped.endswith('|'):
            table_lines.append(stripped)
            i += 1
            continue
        else:
            if table_lines:
                t_flowable = flush_table(table_lines)
                if t_flowable:
                    story.append(Spacer(1, 4))
                    story.append(t_flowable)
                    story.append(Spacer(1, 6))
                table_lines = []

        if not stripped:
            i += 1
            continue

        # Headings
        if stripped.startswith('# '):
            text = stripped[2:].strip()
            story.append(Paragraph(text, title_style))
            story.append(Spacer(1, 4))
        elif stripped.startswith('## '):
            text = stripped[3:].strip()
            story.append(Paragraph(text, h1_style))
            story.append(HRFlowable(width="100%", thickness=0.75, color=colors.HexColor('#0D47A1'), spaceAfter=6, spaceBefore=2))
        elif stripped.startswith('### '):
            text = stripped[4:].strip()
            story.append(Paragraph(text, h2_style))
        elif stripped.startswith('**Authors:**') or stripped.startswith('**Date:**') or stripped.startswith('authors:') or stripped.startswith('date:'):
            story.append(Paragraph(stripped, meta_style))
        elif stripped.startswith('* ') or stripped.startswith('- '):
            text = stripped[2:].strip()
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
            story.append(Paragraph(f"• {text}", bullet_style))
        elif re.match(r'^\d+\.\s', stripped):
            text = re.sub(r'^\d+\.\s', '', stripped)
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
            num = re.match(r'^\d+\.', stripped).group(0)
            story.append(Paragraph(f"<b>{num}</b> {text}", bullet_style))
        elif re.match(r'^!\[(.*?)\]\((.*?)\)', stripped):
            # Handle Image insertion
            match = re.match(r'^!\[(.*?)\]\((.*?)\)', stripped)
            img_path = match.group(2)
            try:
                # Dynamically scale image to fit within page margins (522 points max)
                img = Image(img_path)
                max_width = 500.0
                ratio = max_width / float(img.imageWidth)
                img.drawWidth = max_width
                img.drawHeight = img.imageHeight * ratio
                
                story.append(Spacer(1, 10))
                story.append(img)
                story.append(Spacer(1, 15))
            except Exception as e:
                print(f"Failed to load image {img_path}: {e}")
        else:
            # Inline bold/italic formatting
            formatted = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', stripped)
            formatted = re.sub(r'\*(.*?)\*', r'<i>\1</i>', formatted)
            # Latex style inline formulas cleanup
            formatted = re.sub(r'\$(.*?)\$', r'<i>\1</i>', formatted)
            story.append(Paragraph(formatted, body_style))

        i += 1

    if table_lines:
        t_flowable = flush_table(table_lines)
        if t_flowable:
            story.append(t_flowable)

    doc.build(story)
    print("PDF build completed successfully.")

if __name__ == "__main__":
    markdown_to_pdf(r"e:\DEMENTIA\EDRAS_Research_Paper.md", r"e:\DEMENTIA\EDRAS_Research_Paper.pdf")
