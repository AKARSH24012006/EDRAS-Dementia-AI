# 📌 EDRAS Project Abstract, Problem Statement & Poster Blueprint

---

## 📝 Abstract

**Concise Abstract (50 Words):**  
EDRAS (Early Dementia Risk Analysis System) integrates multimodal MRI imaging, clinical data, and advanced machine learning to predict dementia stages. A Flask API serves a React/Vite dashboard for clinicians, enabling real‑time risk assessment, personalized care plans, and telehealth support. Comprehensive validation across nine experiments demonstrates high accuracy and HIPAA‑compliant security.

**Detailed Abstract (78 Words):**  
The Early Dementia Risk Analysis System (EDRAS) fuses multimodal brain‑MRI imaging, demographic, and clinical biomarkers with a pipeline of nine rigorously validated machine‑learning models—including Bayesian logistic regression, hidden‑Markov sequential prediction, and a Random‑Forest ensemble achieving 85% diagnostic accuracy. A secure Flask REST‑API delivers these predictions to a responsive React/Vite dashboard that supports clinician login, patient portals, subscription‑based telehealth sessions, and real‑time risk visualizations. The platform complies with HIPAA‑mandated encryption, audit‑logging, and token‑based authentication, offering a reproducible, production‑ready tool for early dementia detection and personalized care.

---

## 🎯 Problem Statement

Early‑onset dementia is often diagnosed only after substantial cognitive decline, limiting the effectiveness of therapeutic interventions and increasing the burden on patients, families, and healthcare systems. Current clinical workflows rely on subjective neuro‑psychological tests and limited imaging analysis, which are:

- **Late‑stage:** Detectable changes appear after irreversible neuronal loss.
- **Subjective & time‑consuming:** Clinicians manually interpret MRI scans and clinical charts, leading to variability and diagnostic delays.
- **Fragmented data:** Imaging, demographics, and laboratory results are stored in disparate systems, hindering holistic risk assessment.
- **Privacy‑constrained:** Patient health information (PHI) must be protected under HIPAA, preventing easy sharing of raw data for research or AI‑based tools.

**Core Problem:**  
*How can we develop a secure, end‑to‑end, AI‑driven platform that integrates multimodal MRI imaging, demographic, and clinical biomarker data to provide an objective, early‑stage risk assessment for dementia, while ensuring HIPAA‑compliant data handling and delivering actionable insights to clinicians through an intuitive web interface?*

---

## 📋 Poster Blueprint – "EDRAS: AI‑Powered Early Dementia Risk Analysis System"

### 1️⃣ Title & Header
- **Title:** EDRAS – Early Dementia Risk Analysis System (AI‑Driven Multimodal Prediction & Clinical Decision Support)
- **Author:** devcrazy2812 (ABHAY)
- **Repository:** [https://github.com/devcrazy2812/AI-POWERED-DIMENTIA-PREVENTION-SYSTEM](https://github.com/devcrazy2812/AI-POWERED-DIMENTIA-PREVENTION-SYSTEM)

### 2️⃣ Objectives
- **Integrate** multimodal brain‑MRI, demographic, and laboratory data into a unified pipeline.
- **Develop & Benchmark** 9 machine‑learning models for dementia‑stage classification.
- **Deploy** a Flask‑based REST API + React/Vite UI for real‑time clinician interaction.
- **Guarantee** HIPAA‑level security (AES‑256 encryption, JWT auth, audit logging).

### 3️⃣ Dataset Summary
- **Total MRI Scans:** 86,437 images across 4 categories (Non Demented, Very Mild, Mild, Moderate Dementia).
- **Tabular CSV Data:** 10,880 samples.

### 4️⃣ Results & Benchmarks
- **Best Accuracy (Ensemble – Task 9):** 85.00% (5-fold CV)
- **Weighted F1-Score:** 0.8496
- **Multiclass AUC:** 0.92
- **PCA Cumulative Variance (4 PCs):** 96.69%
- **CART Decision Tree Accuracy:** 81.81% (5-fold CV)
- **SVM RBF Kernel Accuracy:** 72.81% (5-fold CV)

### 5️⃣ System Architecture & Security
- **Backend:** Flask REST API (`app/ai_service.py`, `app/security.py`)
- **Frontend:** React 18 + Vite (Clinical Dashboard, Patient Portal, Telehealth Room, AI Chatbot)
- **Security Audit:** 8/8 Passed (100% HIPAA Compliant with AES-256 Fernet encryption, PBKDF2/Scrypt password hashing, JWT authentication, and audit logs).

---

## 🎨 Prompt for AI Poster Generation

> **Prompt:**  
> "Create a high‑resolution (A0 size) scientific poster for a medical AI project titled 'EDRAS – Early Dementia Risk Analysis System'. Use a modern, dark‑mode aesthetic with vibrant teal and amber accents. Layout sections in a clean grid: Title bar with bold sans‑serif font, Problem Statement, Objectives, Methodology flowchart, Dataset table, Results with large numbers (85% accuracy, 0.92 AUC), Architecture diagram (boxes for Flask API, React UI, encrypted SQLite DB), Security checklist icons (lock, shield), and a footer with authors and contact. Include placeholders for six image thumbnails: PCA biplot, HMM sequence, Decision‑tree, Ensemble confusion matrix, Feature importance, ROC curves. Add subtle micro‑gradient background, minimal drop shadows, and a thin white border. Emphasize headline text with a slight glow. Render in 300 DPI vector‑style graphics suitable for printing."
