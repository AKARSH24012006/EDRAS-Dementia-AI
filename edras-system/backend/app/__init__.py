from flask import Flask
from flask_cors import CORS
from app.config import config_by_name
from app.models import db

def create_app(config_name='dev'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    CORS(app)
    db.init_app(app)

    with app.app_context():
        from app.routes.auth_routes import auth_bp
        from app.routes.patient_routes import patient_bp
        from app.routes.assessment_routes import assessment_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(patient_bp, url_prefix='/api/patients')
        app.register_blueprint(assessment_bp, url_prefix='/api/assessments')

        @app.route('/')
        def index():
            return {"status": "success", "message": "EDRAS Backend API is running successfully! Please navigate to http://localhost:5173 to access the React Frontend Dashboard."}

        db.create_all() # Initialize tables

    return app
