<div align="center">

# 🧠 EDRAS: AI-Powered Dementia Prevention & Risk Analysis System
### *An Enterprise Multimodal AI Platform for Early Dementia Screening, 3D Digital Biomarker Analysis, and Clinical Decision Support*

[![Author](https://img.shields.io/badge/Author-devcrazy2812-orange?style=for-the-badge&logo=github)](https://github.com/devcrazy2812/AI-POWERED-DIMENTIA-PREVENTION-SYSTEM)
[![Python](https://img.shields.io/badge/Python-3.9%2B%20%7C%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![HIPAA Compliant](https://img.shields.io/badge/HIPAA-AES--256%20Compliant-blueviolet?style=for-the-badge)](edras-system/backend/verify_security_database.py)
[![Security Audit](https://img.shields.io/badge/Security%20Audit-8%2F8%20Passed%20(100%25)-brightgreen?style=for-the-badge)](edras-system/backend/verify_security_database.py)
[![Integration Tests](https://img.shields.io/badge/Integration%20Tests-11%2F11%20Passed-brightgreen?style=for-the-badge)](edras-system/backend/test_backend_ml_integration.py)

</div>

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Repository Structure](#-repository-structure)
- [Unified Machine Learning Engine](#-unified-machine-learning-engine)
- [Dual-Role Access Control (RBAC) & Clearance Wall](#-dual-role-access-control-rbac--clearance-wall)
- [Interactive 3D Neuroimaging Visualizer](#-interactive-3d-neuroimaging-visualizer)
- [Clinical AI Neurological Assistant (Chatbot)](#-clinical-ai-neurological-assistant-chatbot)
- [Security & HIPAA Compliance Architecture](#-security--hipaa-compliance-architecture)
- [REST API Reference](#-rest-api-reference)
- [Quick Start & Execution Guide](#-quick-start--execution-guide)
- [Automated Verification & Testing](#-automated-verification--testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔬 Executive Overview

Dementia affects over 55 million individuals worldwide, yet early screening pathways remain bottlenecked by high imaging costs, diagnostic delays, and specialized neurologist shortages. **EDRAS** (Early Dementia Risk Analysis System) is an enterprise-grade, full-stack medical AI software platform built to democratize early cognitive decline detection through multimodal machine learning, interactive 3D anatomical visualization, and privacy-preserving clinical workflows.

### Core Capabilities:
- **Unified Multimodal ML Engine (`unified_ml_engine.py`)**: Consolidates 9 classical ML tasks into a single high-performance pipeline. Extracts 17 structural tissue biomarkers from brain MRI scans, applies PCA dimensionality reduction, continuously estimates Dementia Risk Index (DRI 0–100%) via Ridge Regression, and classifies patients across 4 clinical stages (*Non Demented*, *Very Mild Dementia*, *Mild Dementia*, *Moderate Dementia*) using a Soft Voting Ensemble (Random Forest + Gradient Boosting).
- **Interactive 3D Volumetric Visualizer**: Embedded HTML5 Canvas 3D brain visualizer with 130+ anatomical nodes, interactive mouse drag rotation, pitch/yaw controls, and coronal/axial slicing proxies without altering the platform's signature cyan/sky medical styling.
- **Dual-Role Access Control (Doctor vs. Patient)**: Strict client-side route guards and backend role-based access control (RBAC). Patients are restricted from viewing clinician dashboards, raw scan upload pipelines, and peer patient registries via an interactive Clearance Wall (`AccessDenied`).
- **Clinical AI Chatbot**: Integrated neurology assistant delivering instant interpretations of MRI biomarkers, Clinical Dementia Rating (CDR) metrics, Mini-Mental State Examination (MMSE) scores, MIND diet dietary protocols, and pharmacological contraindication flags.
- **HIPAA AES-256 Security Vault**: End-to-end PII encryption using AES-256 Fernet tokens, salted PBKDF2 password hashing, JWT HS256 authentication, filename sanitization, and immutable audit logs.

---

## 🏗 System Architecture

```text
+-------------------------------------------------------------------------------+
|                       REACT 18 + VITE CLIENT INTERFACE                        |
|                                                                               |
|  +---------------------------+   +-----------------------------------------+  |
|  |   Clinician Portal        |   |             Patient Portal              |  |
|  | - MRI Scan Upload & AI    |   | - Personal Health Summary               |  |
|  | - 3D Brain Volumetric View|   | - AI Neurology Chatbot Assistant        |  |
|  | - Encrypted Patient Roster|   | - Cognitive Wellness Regimen            |  |
|  | - Longitudinal Analytics  |   | - Restricted from Clinician Tools [403] |  |
|  +---------------------------+   +-----------------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        |  HTTP REST / JWT HS256 / JSON
                                        v
+-------------------------------------------------------------------------------+
|                        FLASK 3.0 REST API MICROSERVICE                        |
|                                                                               |
|  +--------------------+  +----------------------+  +-----------------------+  |
|  |  Security Layer    |  |  RBAC Decorators     |  |  Audit & Logging      |  |
|  | - JWT Verification |  | - @doctor_required   |  | - HIPAA Audit Log     |  |
|  | - AES-256 Fernet   |  | - @token_required    |  | - Secure File Handler |  |
|  +--------------------+  +----------------------+  +-----------------------+  |
|                                       |                                       |
|                                       v                                       |
|  +-------------------------------------------------------------------------+  |
|  |                      ai_service.py (Facade Layer)                       |  |
|  | - Singleton Predictor Cache     - Memory-Safe Execution Engine          |  |
|  | - Fallback Heuristic Engine     - Error Isolation & Rollback Handling   |  |
|  +------------------------------------+------------------------------------+  |
+---------------------------------------|---------------------------------------+
                                        |
               +------------------------+------------------------+
               |                                                 |
               v                                                 v
+-------------------------------+             +----------------------------------+
|   SQLite / PostgreSQL DB     |             |   UNIFIED MACHINE LEARNING       |
|  - AES-256 Encrypted Patients |             |   ENGINE (unified_ml_engine.py)  |
|  - Salted PBKDF2 Credentials  |             | - 17 Tissue Biomarker Extractor  |
|  - Scan Assessments & Reports |             | - PCA Dimensionality Reducer    |
|  - Immutable Audit Records    |             | - Soft Voting Ensemble (RF+GBM)  |
+-------------------------------+             | - Ridge Dementia Risk Index (DRI)|
                                              +----------------------------------+
```

---

## 📂 Repository Structure

```text
e:\DEMENTIA\
├── DATASET/                                  # Brain MRI structural imaging collections
│   ├── Data/                                 # 86,437 scans across 4 clinical stages
│   └── Alzheimers_Detection_dataset/         # 10,880 scans with CSV split labels
├── edras-system/                             # Full-Stack Application
│   ├── ai_engine/                            # Machine Learning Core
│   │   ├── unified_ml_engine.py              # Consolidated single-file ML engine
│   │   ├── models/                           # Trained joblib artifacts
│   │   │   └── dementia_ensemble_model.joblib
│   │   ├── model_architecture.py             # Multimodal late-fusion PyTorch model
│   │   └── feature_extraction.py             # Acoustic and linguistic extractors
│   ├── backend/                              # Flask Application
│   │   ├── app/                              # Application package
│   │   │   ├── models.py                     # SQLAlchemy models with AES-256 PII fields
│   │   │   ├── security.py                   # JWT HS256, Fernet cryptography, RBAC
│   │   │   ├── ai_service.py                 # Predictor facade with fallback handling
│   │   │   └── routes/                       # REST endpoint blueprints
│   │   │       ├── auth_routes.py            # User authentication & registration
│   │   │       ├── patient_routes.py         # Encrypted patient registry (@doctor_required)
│   │   │       └── assessment_routes.py      # MRI scan analysis & AI chatbot routes
│   │   ├── test_backend_ml_integration.py    # 11-point end-to-end integration test suite
│   │   ├── verify_security_database.py       # 8-point HIPAA security audit script
│   │   ├── requirements.txt                  # Python dependencies
│   │   └── run.py                            # Flask server entry point (port 5000)
│   └── frontend/                             # React 18 + Vite User Interface
│       ├── src/                              # Component source code
│       │   ├── components/                   # UI modules
│       │   │   ├── Brain3DVisualizer.jsx     # Interactive 3D brain mesh visualizer
│       │   │   ├── AccessDenied.jsx          # RBAC Clearance Wall component
│       │   │   ├── Navbar.jsx                # Dynamic role-segregated navigation
│       │   │   ├── AIChatBot.jsx             # Conversational neurology assistant
│       │   │   └── ...
│       │   ├── pages/                        # Role-specific application views
│       │   │   ├── Login.jsx                 # Dual-login toggle (Doctor vs Patient)
│       │   │   ├── Dashboard.jsx             # Clinician analytics & cohort stats
│       │   │   ├── ScanAnalysis.jsx          # MRI upload, 3D render & AI diagnosis
│       │   │   ├── Patients.jsx              # HIPAA-protected clinical registry
│       │   │   └── PatientPortal.jsx         # Patient wellness & symptom tracking
│       │   ├── context/                      # RoleContext & ThemeContext
│       │   ├── services/                     # Axios API service client
│       │   ├── App.jsx                       # Role-guarded client routes
│       │   └── index.css                     # Tailwind CSS + 3D depth styling
│       ├── package.json                      # Node dependencies & Vite build scripts
│       └── vite.config.js                    # Vite configuration
├── EDRAS_Research_Paper.md                   # Comprehensive academic whitepaper
├── PRACTICE_EXPERIMENTS_CHECKLIST.md         # Consolidated ML experiment records
├── CONTRIBUTING.md                           # Developer contribution guidelines
├── LICENSE                                   # MIT License
└── README.md                                 # Master repository documentation
```

---

## 📊 Unified Machine Learning Engine

All individual experiment scripts have been consolidated into `ai_engine/unified_ml_engine.py`, providing a modular, reproducible, and crash-proof machine learning core.

```text
                                [ Brain MRI Scan (JPG/PNG/DCM) ]
                                                |
                                                v
                              +-----------------------------------+
                              |     Tissue Biomarker Extractor    |
                              |  - 17 Statistical & Spatial Props |
                              |  - Ventricle & Parenchyma Ratios  |
                              |  - Cortical Density & Moments     |
                              +-----------------+-----------------+
                                                |
                       +------------------------+------------------------+
                       |                                                 |
                       v                                                 v
        +------------------------------+                  +------------------------------+
        |  Soft Voting Ensemble (85%)  |                  |  Ridge Risk Regressor        |
        |  - Random Forest (Bagging)   |                  |  - Continuous Mapping [0-100]|
        |  - Gradient Boosting (GBM)   |                  |  - Dementia Risk Index (DRI) |
        +--------------+---------------+                  +--------------+---------------+
                       |                                                 |
                       +------------------------+------------------------+
                                                |
                                                v
                              +-----------------------------------+
                              |       Production Predictor        |
                              |  - 4-Stage Dementia Classification|
                              |  - Calibrated Class Probabilities |
                              |  - Regional Atrophy Proxies       |
                              |  - Clinical Recommendation Engine |
                              +-----------------------------------+
```

### Extracted Biomarkers (17 Dimensions):
1. **Intensity Distribution**: `mean_pixel`, `std_pixel`, `var_pixel`, `median_pixel`, `min_pixel`, `max_pixel`
2. **Quantile Boundaries**: `p25_pixel`, `p75_pixel`, `iqr_pixel`
3. **Higher-Order Moments**: `skewness`, `kurtosis`
4. **Anatomical Volume Proxies**:
   - `parenchyma_ratio`: Brain tissue volume relative to total intracranial volume.
   - `ventricle_ratio`: CSF/ventricular space proportion indicating central atrophy.
   - `cortical_density`: Outer cortical gray-matter pixel density.
   - `left_right_asymmetry`: Hemispheric intensity variance indicating focal atrophy.
   - `entropy_proxy`: Shannon entropy proxy measuring tissue texture heterogeneity.
   - `contrast_proxy`: Local gray-level contrast measuring gray/white matter boundary sharpness.

### Command-Line Interface (CLI):
```bash
# View dataset inventory and class balance
python unified_ml_engine.py --summary

# Train model on real MRI scans (stratified across 4 stages)
python unified_ml_engine.py --train --samples 1600

# Run standalone inference on any MRI scan
python unified_ml_engine.py --predict "path/to/brain_scan.jpg"

# Evaluate 5-fold cross validation benchmarks
python unified_ml_engine.py --eval
```

---

## 🔐 Dual-Role Access Control (RBAC) & Clearance Wall

EDRAS enforces strict role separation between Healthcare Providers (**Doctor**) and Individuals/Caregivers (**Patient**).

```text
               +-------------------------------------------+
               |          User Authentication              |
               |  (Doctor Login   vs.   Patient Login)     |
               +---------------------+---------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
       [ Role: 'doctor' ]                          [ Role: 'patient' ]
               |                                           |
               v                                           v
  +--------------------------+                +--------------------------+
  | Full Clinical Privileges |                |  Patient Wellness Space  |
  | - Dashboard Analytics    |                | - Personal Health Record |
  | - MRI Upload & AI Model  |                | - AI Neurological Chatbot|
  | - Patient Registry CRUD  |                | - Symptom Tracking Logs  |
  +--------------------------+                +-------------+------------+
                                                            |
                                             Tries to access Doctor route?
                                                            |
                                                            v
                                              +--------------------------+
                                              |   CLEARANCE WALL [403]   |
                                              |   <AccessDenied /> UI    |
                                              |   "Access Restricted"    |
                                              +--------------------------+
```

### Enforced Protections:
1. **Frontend Route Guards (`App.jsx`)**: Attempts by a patient to navigate to `/dashboard`, `/scan-analysis`, or `/patients` render the `<AccessDenied />` security wall.
2. **Dynamic UI Filtering (`Navbar.jsx`)**: Clinician-only links and rapid role-switching controls are completely hidden when logged in as a patient.
3. **Backend Decorator Defense (`@doctor_required`)**: Endpoints such as `GET /api/patients` and `POST /api/patients` strictly verify that the caller's JWT claims include `role: 'doctor'`. If invoked with a patient token, the API immediately returns `HTTP 403 Forbidden` with an audit record.

---

## 🌐 Interactive 3D Neuroimaging Visualizer

The frontend incorporates an interactive 3D volumetric brain rendering engine (`Brain3DVisualizer.jsx`) that runs natively in the browser without heavy external 3D engine overhead.

- **130+ Spatial Brain Nodes**: Visualizes frontal, temporal, parietal, and occipital lobes, hippocampal regions, and ventricular spaces.
- **Interactive Manipulation**: Full 3D rotation via mouse click-and-drag, intuitive pitch/yaw sliders, and zoom controls.
- **Dynamic Risk Heatmapping**: Nodes dynamically transition between healthy cyan (`#06b6d4`), amber warning, and high-risk crimson based on model-predicted regional atrophy.
- **Slice Proxies**: Coronal and axial scan line toggles illustrating volumetric MRI depth.
- **Style Cohesion**: Integrated seamlessly into the existing medical color system (`#080d16` deep dark background, `#06b6d4` cyan glow, and `#0284c7` medical blue highlights).

---

## 🤖 Clinical AI Neurological Assistant (Chatbot)

The platform features an embedded conversational AI engine accessible from both clinician and patient portals (`/api/assessments/ai-chatbot`).

- **Domain Knowledge Engine**:
  - Explains MRI volumetric markers (hippocampal volume, ventricle enlargement, cortical thinning).
  - Clarifies diagnostic staging (CDR 0 = Normal, 0.5 = Very Mild, 1.0 = Mild, 2.0 = Moderate).
  - Provides lifestyle and neuro-protective recommendations (MIND diet, aerobic exercise, cognitive reserve activities).
  - Outlines clinical risk factors (ApoE4 allele carrier status, vascular health, sleep hygiene).
- **Patient Empathy Guardrails**: Formulates reassuring, evidence-based responses for patients while delivering actionable, metric-driven summaries for healthcare practitioners.

---

## 🛡 Security & HIPAA Compliance Architecture

EDRAS implements comprehensive safeguards adhering to HIPAA Security Rule standards (45 CFR § 164.312):

| HIPAA Security Requirement | EDRAS Implementation Details | Verification Status |
| :--- | :--- | :---: |
| **Transmission Security (§ 164.312(e)(1))** | Token-based authentication using cryptographically signed **JWT HS256** with configurable expiration. | **VERIFIED** |
| **Data At Rest Encryption (§ 164.312(a)(2)(iv))** | Protected Health Information (PHI/PII) encrypted using **AES-256 Fernet** symmetric key encryption. | **VERIFIED** |
| **Access Control (§ 164.312(a)(1))** | Role-Based Access Control enforced at route level via `@token_required` and `@doctor_required`. | **VERIFIED** |
| **Password Integrity** | User passwords hashed using **PBKDF2-HMAC-SHA256** with unique cryptographically random salts. | **VERIFIED** |
| **Audit Controls (§ 164.312(b))** | Immutable HIPAA audit logging capturing timestamp, user ID, client IP, action, and resource ID. | **VERIFIED** |
| **Input & File Upload Defense** | File uploads strictly sanitized: allowed extensions restricted to `.jpg`, `.jpeg`, `.png`, `.dcm`, `.dicom`. | **VERIFIED** |
| **Crash Protection & Rollback** | Database transactions wrapped in try/except blocks with automated `db.session.rollback()` on exceptions. | **VERIFIED** |

---

## 📡 REST API Reference

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/register`: Create a new user account with role assignment (`doctor` or `patient`).
- `POST /api/auth/login`: Authenticate credentials; returns signed JWT token and user profile object.
- `PUT /api/auth/profile`: Update clinician or patient profile preferences.

### Patient Registry Endpoints (`/api/patients`)
- `GET /api/patients`: *[Doctor Only]* Retrieve cohort of patients with automatically decrypted PII records.
- `POST /api/patients`: *[Doctor Only]* Enroll a new patient with transparent AES-256 PII encryption.
- `GET /api/patients/<id>`: *[Authenticated]* Retrieve specific patient clinical details.

### Assessment & AI Endpoints (`/api/assessments`)
- `POST /api/assessments/analyze-mri`: Upload an MRI scan for real-time feature extraction, 4-stage ensemble classification, and DRI regression.
- `GET /api/assessments/dashboard-stats`: Aggregate cohort metrics (total patients, scans analyzed, high-risk count, recent diagnoses).
- `GET /api/assessments/scans`: List all analyzed scans and diagnosis histories.
- `POST /api/assessments/ai-chatbot`: Interactive clinical neurology assistant for question answering.
- `POST /api/assessments/upload-patient-report`: Upload and archive clinical lab reports.

---

## 🚀 Quick Start & Execution Guide

### Prerequisites
- Python 3.9+ or Python 3.13
- Node.js 18+ and npm
- Git

### 1. Backend Setup & Startup
```powershell
# Navigate to backend directory
cd edras-system\backend

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask API server (runs on http://localhost:5000)
python run.py
```

### 2. Frontend Setup & Startup
```powershell
# In a new terminal, navigate to frontend directory
cd edras-system\frontend

# Install Node dependencies
npm install

# Start the Vite development server (runs on http://localhost:5173)
cmd /c npm run dev
```

### 3. Unified ML Engine Commands
```powershell
# Navigate to AI Engine directory
cd edras-system\ai_engine

# Run inference on a sample scan
python unified_ml_engine.py --predict "path/to/scan.jpg"

# Retrain model on real dataset
python unified_ml_engine.py --train --samples 1600
```

---

## 🧪 Automated Verification & Testing

EDRAS includes two comprehensive test suites verifying end-to-end integration and security compliance:

### 1. Full-Stack ML Integration Test Suite (`11/11 Passed`)
Verifies API accessibility, role-based authentication, model predictions, database persistence, and chatbot accuracy:
```powershell
python edras-system\backend\test_backend_ml_integration.py
```
```text
================================================================================
           EDRAS BACKEND & AI MODEL FULL INTEGRATION TEST SUITE
================================================================================
 [1/11] Flask Health Check Endpoint              : PASS
 [2/11] User Login & JWT Token Generation        : PASS
 [3/11] Patient Profile Access with JWT          : PASS
 [4/11] Direct ML Unified Engine Inference       : PASS
 [5/11] Real MRI Upload & Model Analysis API     : PASS
 [6/11] Dashboard Stats API                      : PASS
 [7/11] Patient List Endpoint & Auto-Seeding     : PASS
 [8/11] Patient Registration with AES-256 PII    : PASS
 [9/11] AI Neurological Chatbot Knowledge Query  : PASS
[10/11] Patient Report File Upload & Storage     : PASS
[11/11] Patient Access Block to Doctor Endpoints : PASS
================================================================================
 OVERALL INTEGRATION TEST RESULT: ALL 11 TESTS PASSED (100% SUCCESS)
================================================================================
```

### 2. HIPAA Security & Cryptography Audit (`8/8 Passed`)
Validates database integrity, encryption keys, password salting, token expiration, and audit logging:
```powershell
python edras-system\backend\verify_security_database.py
```
```text
================================================================================
 Database Engine Connected     : PASS [OK]
 Database Tables Verified (7/7): PASS [OK]
 PBKDF2 Password Hashing       : PASS [OK]
 JWT HS256 Token Auth          : PASS [OK]
 Patient PII Protection        : PASS [OK]
 HIPAA Audit Logging           : PASS [OK]
 File Upload Sanitization      : PASS [OK]
 Subscription & Billing Engine : PASS [OK]
--------------------------------------------------------------------------------
 OVERALL AUDIT SCORE           : 8/8 CHECKS PASSED (100% COMPLIANT)
================================================================================
```

---

## 🤝 Contributing

We welcome contributions from machine learning researchers, clinical neurologists, and software engineers. Please review [CONTRIBUTING.md](CONTRIBUTING.md) for code styling guidelines, test requirements, and pull request procedures.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for complete details.
