import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'edras-super-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///edras_clinical.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-edras-secret-key-2026')
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32 MB MAX upload
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'dicom', 'dcm', 'pdf', 'csv', 'wav', 'mp3', 'flac', 'm4a'}

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config_by_name = {
    'dev': DevelopmentConfig,
    'prod': ProductionConfig,
    'default': DevelopmentConfig
}
