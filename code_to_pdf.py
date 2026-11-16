import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def code_to_pdf(source_path, dest_path):
    doc = SimpleDocTemplate(
        dest_path,
        pagesize=letter,
        rightMargin=45,
        leftMargin=45,
        topMargin=45,
        bottomMargin=45
    )
    styles = getSampleStyleSheet()
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        wordWrap='CJK'
    )
    
    with open(source_path, 'r', encoding='utf-8') as f:
        code_text = f.read()
        
    story = [Preformatted(code_text, code_style)]
    doc.build(story)
    print(f"Created {dest_path}")

if __name__ == "__main__":
    code_to_pdf("e:/DEMENTIA/generate_master_tasks_docx.py", "e:/DEMENTIA/generate_master_tasks_docx.pdf")
