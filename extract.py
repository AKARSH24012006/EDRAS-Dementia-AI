import sys
import subprocess

def install_and_import(package):
    try:
        import fitz
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMuPDF"])
        import fitz
    return fitz

fitz = install_and_import("PyMuPDF")
doc = fitz.open(r"e:\DEMENTIA\EDRAS_FINAL_MASTER_PROJECT_BOOK.pdf")
text = "\n".join([page.get_text() for page in doc])
with open(r"e:\DEMENTIA\extracted_text.txt", "w", encoding="utf-8") as f:
    f.write(text)
print("Text extracted successfully.")
