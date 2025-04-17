from flask import request
from app.models.model import Chats
from app.db import db_session
from app import socketio

connected_clients = {}

@socketio.on('connect')
def handle_connect():
    custom_id = request.args.get('id')
    if custom_id:
        connected_clients[custom_id] = request.sid
    socketio.emit('online_users', list(connected_clients.keys()))

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    user_id = next((cid for cid, s in connected_clients.items() if s == sid), None)
    if user_id:
        del connected_clients[user_id]
        socketio.emit('user_disconnected', user_id)

@socketio.on('message')
def handle_message(data):
    sender = data['from']
    receiver = data['to']
    message = data['message']
    msg_id = data['id']

    if receiver in connected_clients:
        socketio.emit('message', {'text': message, 'from': sender}, to=connected_clients[receiver], callback=lambda: socketio.emit('ack', {'success': True, 'id': msg_id}, to=request.sid))

    db_session.add(Chats(sender=sender, receiver=receiver, message=message))
    db_session.commit()
