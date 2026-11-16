from flask import Blueprint, request, jsonify, current_app
from app.models import db, User, AuditLog
from app.security import hash_password, verify_password, generate_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name', 'Dr. Clinician')
    role = data.get('role', 'Clinician')

    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields (username, email, password)'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'User with this username or email already exists.'}), 409

    pwhash = hash_password(password)
    new_user = User(
        username=username,
        email=email,
        password_hash=pwhash,
        full_name=full_name,
        role=role
    )
    db.session.add(new_user)
    db.session.commit()

    token = generate_token(new_user.id, new_user.role, current_app.config['JWT_SECRET_KEY'])
    return jsonify({
        'message': 'User registered successfully.',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password.'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid username or password.'}), 401

    token = generate_token(user.id, user.role, current_app.config['JWT_SECRET_KEY'])

    log = AuditLog(user_id=user.id, action='USER_LOGIN', ip_address=request.remote_addr, details=f"Logged in as {user.username}")
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'message': 'Login successful.',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
def update_profile():
    data = request.get_json() or {}
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Missing username identifier'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        # Create or update user object dynamically
        user = User(
            username=username,
            email=data.get('email', 'user@edras-clinical.org'),
            password_hash=hash_password('default123'),
            full_name=data.get('full_name', 'Clinical User'),
            role=data.get('role', 'Senior Neurologist')
        )
        db.session.add(user)

    if 'full_name' in data: user.full_name = data['full_name']
    if 'email' in data: user.email = data['email']
    if 'role' in data: user.role = data['role']
    if 'phone' in data: user.phone = data['phone']
    if 'department' in data: user.department = data['department']
    if 'profile_pic' in data: user.profile_pic = data['profile_pic']

    db.session.commit()

    log = AuditLog(user_id=user.id, action='PROFILE_UPDATE', ip_address=request.remote_addr, details=f"Updated profile for {user.username}")
    db.session.add(log)
    db.session.commit()

    return jsonify({
        'message': 'User profile updated successfully.',
        'user': user.to_dict()
    }), 200

