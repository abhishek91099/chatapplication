from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
from app.models.model import User
from app.db import db_session

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = db_session.query(User).filter_by(username=data.get('username')).first()
    if user and user.password == data.get('password'):
        login_user(user)
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if db_session.query(User).filter_by(username=data.get('username')).first():
        return jsonify({'success': False, 'message': 'Username exists'}), 400
    new_user = User(username=data['username'], password=data['password'])
    db_session.add(new_user)
    db_session.commit()
    return jsonify({'success': True})

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})
