from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app.db import db_session
from app.models.model import Chats, User

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/users', methods=['GET'])
def all_users():
    users = db_session.query(User).all()
    return jsonify([{'id': user.id, 'username': user.username} for user in users])

@chat_bp.route('/message', methods=['POST'])
def fetch_messages():
    sender = request.get_json().get('sender')
    chats = db_session.query(Chats).filter(or_(Chats.sender == sender, Chats.receiver == sender)).all()
    return jsonify([
        {
            'id': chat.id,
            'timestamp': chat.timestamp,
            'sender': chat.sender,
            'receiver': chat.receiver,
            'message': chat.message
        }
        for chat in chats
    ])
