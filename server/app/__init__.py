from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_login import LoginManager
from .db import db_session
from .models.model import User

socketio = SocketIO(cors_allowed_origins="*")
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object('app.config.Config')

    login_manager.init_app(app)
    socketio.init_app(app)

    from .auth.routes import auth_bp
    from .chat.routes import chat_bp
    from .profile.routes import profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(profile_bp)

    return app

@login_manager.user_loader
def load_user(user_id):
    return db_session.query(User).get(user_id)
