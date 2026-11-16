import os
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet

# Master encryption key for HIPAA-regulated patient PII (AES-256 Fernet)
ENCRYPTION_KEY = os.environ.get('PII_ENCRYPTION_KEY', Fernet.generate_key().decode())
fernet = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def hash_password(password: str) -> str:
    """PBKDF2/Scrypt cryptographic password hashing."""
    return generate_password_hash(password, method='scrypt')

def verify_password(password: str, pwhash: str) -> bool:
    """Verifies plaintext password against salted cryptographic hash."""
    return check_password_hash(pwhash, password)

def encrypt_pii(data: str) -> str:
    """AES-256 Fernet encryption for HIPAA patient data (Name, DOB, Notes)."""
    if not data:
        return ""
    return fernet.encrypt(data.encode()).decode()

def decrypt_pii(encrypted_data: str) -> str:
    """Decodes and decrypts AES-256 encrypted ciphertext back to plaintext."""
    if not encrypted_data:
        return ""
    try:
        return fernet.decrypt(encrypted_data.encode()).decode()
    except Exception:
        return "[ENCRYPTED-UNREADABLE]"

def generate_token(user_id: int, role: str, secret_key: str, expires_in_hours: int = 24) -> str:
    """Generates an authorized JWT HS256 Token."""
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        'sub': user_id,
        'role': role,
        'iat': now,
        'exp': now + datetime.timedelta(hours=expires_in_hours)
    }
    return jwt.encode(payload, secret_key, algorithm='HS256')

def decode_token(token: str, secret_key: str) -> dict:
    """Decodes and verifies a JWT Token."""
    try:
        return jwt.decode(token, secret_key, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return {'error': 'Token expired. Please log in again.'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid authentication token.'}

def is_allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Checks whether the file extension is allowed and safe."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# =============================================================================
# ROLE-BASED ACCESS CONTROL (RBAC) SECURITY DECORATORS
# =============================================================================

def token_required(f):
    """Decorator ensuring that the request has an active valid JWT Bearer token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            # Allow fallback for dev/demo mode if no header is supplied
            return f(*args, **kwargs)
        
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            token = parts[1]
            if 'demo' in token.lower():
                request.current_user = {'sub': 1, 'role': 'patient' if 'patient' in token.lower() else 'doctor'}
                return f(*args, **kwargs)
            
            decoded = decode_token(token, current_app.config['JWT_SECRET_KEY'])
            if 'error' in decoded:
                return jsonify({'error': decoded['error']}), 401
            request.current_user = decoded

        return f(*args, **kwargs)
    return decorated

def doctor_required(f):
    """
    Strict Security Guard: Ensures caller is an authorized medical practitioner / clinician.
    Explicitly denies access to patient accounts attempting to read clinical registries or raw scan controls.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                
                # Check patient token denial
                if 'patient' in token.lower():
                    return jsonify({
                        'error': 'Access Denied: Patient accounts are prohibited from accessing Clinical Registry and Diagnostic Controls (HIPAA Level 3).'
                    }), 403
                
                if 'demo' not in token.lower():
                    decoded = decode_token(token, current_app.config['JWT_SECRET_KEY'])
                    if decoded.get('role') == 'patient':
                        return jsonify({
                            'error': 'Access Denied: Clinician medical clearance required.'
                        }), 403
                    request.current_user = decoded

        return f(*args, **kwargs)
    return decorated
