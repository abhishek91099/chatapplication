from flask import Blueprint, request, jsonify
from app.db import db_session
from app.models.model import Profile

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET'])
def profile():
    username = request.get_json().get('username')
    existing_user = db_session.query(Profile).filter_by(username=username).first()
    if existing_user:
        return jsonify({'success': True, 'profile': {
            'id': existing_user.id,
            'About': existing_user.about_me
        }})
    return jsonify({'success': False}), 404

@profile_bp.route('/update_aboutme', methods=['POST'])
def update_aboutme():
    data = request.get_json()
    # Add logic to update the about_me field
    return jsonify({'success': True})
