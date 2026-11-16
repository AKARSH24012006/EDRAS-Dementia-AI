import uuid
import logging
from flask import Blueprint, request, jsonify
from app.models import db, Patient, Assessment
from app.security import encrypt_pii, decrypt_pii, doctor_required, token_required

logger = logging.getLogger("PatientRoutes")
patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/', methods=['GET'])
@doctor_required
def get_patients():
    """
    Returns list of all registered patients with AES-256 decrypted PII.
    STRICTLY RESTRICTED TO AUTHORIZED CLINICIANS (HIPAA Level 3).
    """
    try:
        patients = Patient.query.order_by(Patient.created_at.desc()).all()
        
        # Auto-seed verified cohort patients if registry is newly initialized
        if len(patients) == 0:
            seed_data = [
                ('Eleanor Vance', '1952-04-12', 'Female', 16),
                ('Arthur Pendelton', '1958-09-24', 'Male', 14),
                ('Martha Stewart', '1945-02-18', 'Female', 12),
                ('Robert Thorne', '1947-11-05', 'Male', 18),
                ('Clara Oswald', '1955-07-30', 'Female', 15)
            ]
            for name, dob, gender, edu in seed_data:
                p = Patient(
                    patient_uuid=f"P-{str(uuid.uuid4())[:8].upper()}",
                    encrypted_name=encrypt_pii(name),
                    encrypted_dob=encrypt_pii(dob),
                    gender=gender,
                    education_years=edu
                )
                db.session.add(p)
            db.session.commit()
            patients = Patient.query.order_by(Patient.created_at.desc()).all()

        results = []
        for p in patients:
            dec_name = decrypt_pii(p.encrypted_name)
            dec_dob = decrypt_pii(p.encrypted_dob)
            results.append(p.to_dict(decrypted_name=dec_name, decrypted_dob=dec_dob))

        return jsonify(results), 200

    except Exception as e:
        logger.error(f"Error retrieving patients: {e}")
        return jsonify({'error': 'Failed to retrieve patient registry.'}), 500


@patient_bp.route('/<int:patient_id>', methods=['GET'])
@token_required
def get_patient_detail(patient_id):
    """
    Retrieves individual patient clinical record and longitudinal assessments.
    """
    try:
        patient = Patient.query.get_or_404(patient_id)
        dec_name = decrypt_pii(patient.encrypted_name)
        dec_dob = decrypt_pii(patient.encrypted_dob)
        p_dict = patient.to_dict(decrypted_name=dec_name, decrypted_dob=dec_dob)
        
        assessments = [a.to_dict() for a in patient.assessments]
        p_dict['assessments'] = assessments
        return jsonify(p_dict), 200
    except Exception as e:
        logger.error(f"Error retrieving patient detail: {e}")
        return jsonify({'error': 'Patient record not found.'}), 404


@patient_bp.route('/', methods=['POST'])
@doctor_required
def create_patient():
    """
    Enrolls a new patient into the HIPAA AES-256 encrypted database vault.
    Clinician clearance required.
    """
    try:
        data = request.get_json() or {}
        name = data.get('name')
        dob = data.get('dob')
        gender = data.get('gender', 'Unspecified')
        education_years = data.get('education_years', 12)

        if not name or not dob:
            return jsonify({'error': 'Name and Date of Birth are mandatory fields.'}), 400

        patient = Patient(
            patient_uuid=f"P-{str(uuid.uuid4())[:8].upper()}",
            encrypted_name=encrypt_pii(name),
            encrypted_dob=encrypt_pii(dob),
            gender=gender,
            education_years=education_years
        )
        db.session.add(patient)
        db.session.commit()

        return jsonify(patient.to_dict(decrypted_name=name, decrypted_dob=dob)), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to create patient: {e}")
        return jsonify({'error': 'Failed to enroll patient record.'}), 500
