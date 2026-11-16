import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), default='Senior Neurologist') # Senior Neurologist, Neuro-Radiologist, etc.
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(50), nullable=True, default='+1 (555) 234-5678')
    department = db.Column(db.String(100), nullable=True, default='Department of Neurology & Cognitive Sciences')
    profile_pic = db.Column(db.Text, nullable=True) # Base64 or Image Filename
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    assessments = db.relationship('Assessment', backref='clinician', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'phone': self.phone or '+1 (555) 234-5678',
            'department': self.department or 'Department of Neurology',
            'profile_pic': self.profile_pic or '',
            'created_at': self.created_at.isoformat()
        }

class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    patient_uuid = db.Column(db.String(36), unique=True, nullable=False)
    encrypted_name = db.Column(db.Text, nullable=False)
    encrypted_dob = db.Column(db.Text, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    education_years = db.Column(db.Integer, nullable=False, default=12)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    assessments = db.relationship('Assessment', backref='patient', lazy=True, cascade="all, delete-orphan")

    def to_dict(self, decrypted_name="", decrypted_dob=""):
        return {
            'id': self.id,
            'patient_uuid': self.patient_uuid,
            'name': decrypted_name if decrypted_name else "[ENCRYPTED]",
            'dob': decrypted_dob if decrypted_dob else "[ENCRYPTED]",
            'gender': self.gender,
            'education_years': self.education_years,
            'created_at': self.created_at.isoformat(),
            'assessment_count': len(self.assessments)
        }

class Assessment(db.Model):
    __tablename__ = 'assessments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    clinician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assessment_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Cognitive test scores
    mmse_score = db.Column(db.Float, nullable=True)
    moca_score = db.Column(db.Float, nullable=True)
    
    # Audio metadata
    audio_file_path = db.Column(db.String(256), nullable=True)
    transcript_text = db.Column(db.Text, nullable=True)
    
    # Model inference outputs
    dementia_risk_score = db.Column(db.Float, nullable=False) # 0.0 to 1.0
    classification_label = db.Column(db.String(50), nullable=False) # Healthy, MCI, AD
    confidence_interval = db.Column(db.Float, nullable=False)
    
    # Extracted feature vectors (JSON string)
    feature_summary_json = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'clinician_id': self.clinician_id,
            'assessment_date': self.assessment_date.isoformat(),
            'mmse_score': self.mmse_score,
            'moca_score': self.moca_score,
            'transcript_text': self.transcript_text,
            'dementia_risk_score': round(self.dementia_risk_score, 4),
            'classification_label': self.classification_label,
            'confidence_interval': round(self.confidence_interval, 4)
        }

class MRIScan(db.Model):
    __tablename__ = 'mri_scans'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=True)
    patient_name = db.Column(db.String(120), nullable=True, default="Anonymous Patient")
    patient_age = db.Column(db.Integer, nullable=True, default=70)
    gender = db.Column(db.String(20), nullable=True, default="Unspecified")
    scan_filename = db.Column(db.String(256), nullable=False)
    scan_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Model Predictions
    predicted_stage = db.Column(db.String(50), nullable=False) # Non Demented, Very Mild, Mild, Moderate
    dementia_risk_score = db.Column(db.Float, nullable=False) # 0.0 to 100.0%
    confidence_interval = db.Column(db.Float, nullable=False)
    
    # Image Feature Metrics
    mean_pixel_intensity = db.Column(db.Float, nullable=True)
    pixel_variance = db.Column(db.Float, nullable=True)
    
    # Tissue Region Metrics
    hippocampal_volume = db.Column(db.Float, nullable=True)
    ventricular_volume = db.Column(db.Float, nullable=True)
    cortical_thinning = db.Column(db.Float, nullable=True)
    
    recommendations = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': self.patient_name,
            'patient_age': self.patient_age,
            'gender': self.gender,
            'scan_filename': self.scan_filename,
            'scan_date': self.scan_date.isoformat(),
            'predicted_stage': self.predicted_stage,
            'dementia_risk_score': round(self.dementia_risk_score, 2),
            'confidence_interval': round(self.confidence_interval, 2),
            'mean_pixel_intensity': round(self.mean_pixel_intensity, 2) if self.mean_pixel_intensity else 0,
            'pixel_variance': round(self.pixel_variance, 2) if self.pixel_variance else 0,
            'hippocampal_volume': round(self.hippocampal_volume, 1) if self.hippocampal_volume else 0,
            'ventricular_volume': round(self.ventricular_volume, 1) if self.ventricular_volume else 0,
            'cortical_thinning': round(self.cortical_thinning, 1) if self.cortical_thinning else 0,
            'recommendations': self.recommendations
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    action = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    details = db.Column(db.Text, nullable=True)

class PatientReport(db.Model):
    __tablename__ = 'patient_reports'

    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(120), nullable=False, default='Clinical Patient')
    filename = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False) # pdf, png, jpg, dicom, csv
    upload_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    extracted_summary = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_name': self.patient_name,
            'filename': self.filename,
            'original_name': self.original_name,
            'file_type': self.file_type,
            'upload_date': self.upload_date.isoformat(),
            'extracted_summary': self.extracted_summary or 'Report processed into clinical database.'
        }

class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    plan_name = db.Column(db.String(50), nullable=False, default='Quarterly Pro') # Basic, Quarterly Pro, Yearly Enterprise
    status = db.Column(db.String(20), default='Active') # Active, Expired, Pending
    price = db.Column(db.Float, default=79.0)
    billing_cycle = db.Column(db.String(20), default='quarterly') # monthly, quarterly, yearly
    video_call_credits = db.Column(db.Integer, default=5)
    start_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_name': self.plan_name,
            'status': self.status,
            'price': self.price,
            'billing_cycle': self.billing_cycle,
            'video_call_credits': self.video_call_credits,
            'start_date': self.start_date.isoformat()
        }

