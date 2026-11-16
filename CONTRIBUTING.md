# Contributing to EDRAS (Early Dementia Risk Analysis System)

Thank you for your interest in contributing to **EDRAS**! We welcome contributions from machine learning researchers, clinical neurologists, medical data scientists, full-stack engineers, and security auditors.

---

## 🛠 How to Contribute

### 1. Reporting Bugs & Security Vulnerabilities
- **Security Issues**: For security vulnerabilities involving HIPAA compliance, AES-256 PII encryption, JWT authentication, or access control violations, please email `security@edras-medtech.org` or open a confidential issue.
- **General Bugs**: Open a GitHub Issue detailing the steps to reproduce, expected vs. observed behavior, and relevant logs.

### 2. Machine Learning Contributions
- All core ML tasks have been unified into `edras-system/ai_engine/unified_ml_engine.py`.
- Do not create fragmented standalone experiment scripts. Instead, extend `TissueBiomarkerExtractor`, `StratifiedDatasetManager`, or `ProductionPredictor` within the unified architecture.
- If introducing new multimodal pipelines (e.g., PyTorch 3D CNNs or Vision Transformers), update `model_architecture.py` and verify backward compatibility with `ai_service.py`.

### 3. Frontend Contributions
- The frontend uses React 18, Vite, and Tailwind CSS.
- **Design System Constraint**: Maintain the established medical styling tokens:
  - Deep dark background: `#080d16`
  - Medical cyan accents: `#06b6d4`
  - Clinical sky blue: `#0284c7`
  - Soft light background: `#f0f7ff`
- Ensure 3D interactive components (`Brain3DVisualizer.jsx`) maintain high-frame-rate performance without causing browser memory leaks.
- Uphold strict Role-Based Access Control (RBAC): patients must never be permitted to access doctor-restricted routes.

### 4. Pull Request Workflow
1. **Fork the Repository** and create a feature branch (`git checkout -b feature/enhanced-biomarkers`).
2. **Follow Code Quality Standards**:
   - Python code must conform to PEP 8 standards.
   - React components must follow clean hook structures and semantic JSX.
3. **Verify Pre-Commit Test Requirements**:
   All contributions must pass both automated verification suites before PR submission.
4. **Push & Create PR**: Submit a pull request targeting `main` with a concise, descriptive summary of changes.

---

## 🧪 Mandatory Automated Verification

Before submitting any Pull Request, ensure that both backend verification suites execute with 100% passing tests:

```powershell
# 1. Full-Stack ML Integration Test Suite (11/11 tests)
python edras-system/backend/test_backend_ml_integration.py

# 2. HIPAA Cryptography & Security Audit Suite (8/8 checks)
python edras-system/backend/verify_security_database.py
```

Thank you for helping advance multimodal AI for early dementia screening and clinical decision support!
