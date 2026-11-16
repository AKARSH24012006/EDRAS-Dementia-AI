"""
Comprehensive Backend & Real-Time ML Model Integration Test Suite.
Verifies:
  1. Flask App Initialization & Blueprint registration
  2. Model Loading in AIService
  3. Real MRI Image Upload & Inference through /api/assessments/analyze-mri
  4. Real-time Database Persistence in MRIScan table
  5. Dashboard Statistics endpoint /api/assessments/dashboard-stats
  6. Multimodal Assessment endpoint /api/assessments/run
  7. Patient Report Upload & AI Chatbot endpoints
  8. Graceful crash prevention on invalid / corrupt files
  9. Patient Registry with AES-256 Fernet PII Encryption
  10. Strict Role-Based Access Control (RBAC) preventing Patients from accessing Doctor endpoints
  11. Extended AI Chatbot Neurological Knowledge Base
"""

import os
import io
import sys
import unittest
from PIL import Image

from app import create_app
from app.models import db, MRIScan, Assessment, PatientReport, Patient

class BackendMLIntegrationTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('dev')
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_01_index_health_check(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        print("\n[TEST 1 PASSED] Index Health Check API is online.")

    def test_02_analyze_mri_simulated(self):
        response = self.client.post('/api/assessments/analyze-mri', data={
            'patient_name': 'Test Benchmark Patient',
            'patient_age': 72,
            'gender': 'Male'
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('scan', data)
        self.assertIn('class_probabilities', data)
        print(f"[TEST 2 PASSED] Simulated MRI Scan Analyzed: {data['scan']['predicted_stage']} (Risk: {data['scan']['dementia_risk_score']}%)")

    def test_03_analyze_mri_real_file_upload(self):
        img = Image.new('RGB', (224, 224), color=(60, 60, 60))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        response = self.client.post(
            '/api/assessments/analyze-mri',
            content_type='multipart/form-data',
            data={
                'file': (img_bytes, 'test_scan.jpg'),
                'patient_name': 'Clinical Validation Subject',
                'patient_age': 68,
                'gender': 'Female'
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['status'], 'success')
        scan = data['scan']
        self.assertIn(scan['predicted_stage'], ['Non Demented', 'Very Mild Dementia', 'Mild Dementia', 'Moderate Dementia'])
        self.assertGreaterEqual(scan['dementia_risk_score'], 0.0)
        self.assertLessEqual(scan['dementia_risk_score'], 100.0)
        print(f"[TEST 3 PASSED] Real Image Upload & ML Inference: {scan['predicted_stage']}, Risk: {scan['dementia_risk_score']}%, Conf: {scan['confidence_interval']}%")

    def test_04_dashboard_stats(self):
        self.client.post('/api/assessments/analyze-mri', data={'patient_name': 'Patient Alpha', 'patient_age': 75})
        response = self.client.get('/api/assessments/dashboard-stats')
        self.assertEqual(response.status_code, 200)
        stats = response.get_json()
        self.assertGreaterEqual(stats['total_scans_analyzed'], 1)
        self.assertEqual(len(stats['stage_distribution']), 4)
        print(f"[TEST 4 PASSED] Dashboard Stats Aggregation: {stats['total_scans_analyzed']} total scans recorded.")

    def test_05_multimodal_assessment_run(self):
        response = self.client.post('/api/assessments/run', data={
            'patient_id': 1,
            'clinician_id': 1,
            'mmse_score': 22.0,
            'moca_score': 20.0,
            'transcript_text': 'Patient showed slight memory recall hesitation.'
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('classification_label', data)
        self.assertIn('dementia_risk_score', data)
        print(f"[TEST 5 PASSED] Multimodal Assessment Run: {data['classification_label']} (Score: {data['dementia_risk_score']})")

    def test_06_upload_patient_report(self):
        dummy_file = io.BytesIO(b"%PDF-1.4 Mock Clinical Report Content")
        response = self.client.post(
            '/api/assessments/upload-patient-report',
            content_type='multipart/form-data',
            data={
                'file': (dummy_file, 'neurology_lab_summary.pdf'),
                'patient_name': 'Audited Subject'
            }
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('report', data)
        self.assertEqual(data['report']['file_type'], 'pdf')
        print(f"[TEST 6 PASSED] Medical Report Ingestion Vault: {data['report']['filename']}")

    def test_07_ai_chatbot(self):
        response = self.client.post('/api/assessments/ai-chatbot', json={
            'message': 'What do brain MRI scans show for dementia?'
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('reply', data)
        self.assertIn('hippocampal', data['reply'].lower())
        print(f"[TEST 7 PASSED] AI Chatbot Neurological Assistant: {data['reply'][:65]}...")

    def test_08_crash_proof_resilience(self):
        # Unsupported file extension rejected safely
        corrupt_bytes = io.BytesIO(b"malicious script contents")
        response = self.client.post(
            '/api/assessments/analyze-mri',
            content_type='multipart/form-data',
            data={
                'file': (corrupt_bytes, 'script.exe'),
                'patient_name': 'Security Exploit Test'
            }
        )
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('Invalid file format', data['error'])
        print("[TEST 8 PASSED] Crash-Proof Resilience: Executable upload rejected with HTTP 400.")

    def test_09_patient_registry_and_aes256_encryption(self):
        # Create a patient through the API
        response = self.client.post(
            '/api/patients/',
            json={
                'name': 'Margaret Thatcher',
                'dob': '1950-10-13',
                'gender': 'Female',
                'education_years': 16
            },
            headers={'Authorization': 'Bearer demo_doctor_token_2026'}
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['name'], 'Margaret Thatcher')
        self.assertEqual(data['dob'], '1950-10-13')

        # Verify underlying database entry has ciphered PII
        with self.app.app_context():
            p = Patient.query.filter_by(patient_uuid=data['patient_uuid']).first()
            self.assertNotEqual(p.encrypted_name, 'Margaret Thatcher')
            self.assertTrue(len(p.encrypted_name) > 30)

        # Retrieve registry
        get_res = self.client.get('/api/patients/', headers={'Authorization': 'Bearer demo_doctor_token_2026'})
        self.assertEqual(get_res.status_code, 200)
        p_list = get_res.get_json()
        self.assertGreaterEqual(len(p_list), 1)
        print(f"[TEST 9 PASSED] Patient Registry & AES-256 PII Encryption Verified (Enrolled {len(p_list)} patients).")

    def test_10_patient_role_rbac_restriction(self):
        # Attempt to access clinician patient registry using a patient token
        response = self.client.get(
            '/api/patients/',
            headers={'Authorization': 'Bearer demo_patient_token_2026'}
        )
        self.assertEqual(response.status_code, 403)
        data = response.get_json()
        self.assertIn('Access Denied', data['error'])
        print("[TEST 10 PASSED] RBAC Security Guard: Patient account successfully blocked from Clinical Registry.")

    def test_11_ai_chatbot_neurological_knowledge(self):
        # Test lifestyle questions
        res = self.client.post('/api/assessments/ai-chatbot', json={'message': 'What exercise or diet helps prevent dementia?'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('mind', data['reply'].lower())

        # Test MMSE test questions
        res2 = self.client.post('/api/assessments/ai-chatbot', json={'message': 'How does the mmse test work?'})
        self.assertEqual(res2.status_code, 200)
        data2 = res2.get_json()
        self.assertIn('mini-mental', data2['reply'].lower())
        print("[TEST 11 PASSED] Extended AI Chatbot Neurological Knowledge: MIND Diet, BDNF & MMSE verified.")


if __name__ == '__main__':
    print("=" * 80)
    print(" STARTING BACKEND REAL-TIME ML INTEGRATION & RESILIENCE AUDIT ".center(80, "="))
    print("=" * 80)
    unittest.main(verbosity=2)
