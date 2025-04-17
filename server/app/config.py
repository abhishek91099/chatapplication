from urllib.parse import quote_plus

class Config:
    SECRET_KEY = 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = f'postgresql://postgres:{quote_plus("root@123")}@127.0.0.1:5432/resumeproject'
