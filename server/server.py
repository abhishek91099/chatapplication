from flask import Flask, jsonify, request
from flask_socketio import SocketIO,emit
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from sqlalchemy import Column, Integer, String, create_engine,  DateTime, func,Text,or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
from urllib.parse import quote_plus

# PostgreSQL database setup
password = quote_plus('root@123')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = 'your_secret_key'

# PostgreSQL database setup
engine = create_engine(f'postgresql://postgres:{password}@127.0.0.1:5432/resumeproject')
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
Base = declarative_base()

# User model
class User(UserMixin, Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(50), nullable=False, unique=True)
    password = Column(String(100), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'
    
class Chats(Base):
    __tablename__='chats'
    id = Column(Integer, primary_key=True)
    sender=Column(String(50), nullable=False)
    receiver=Column(String(50),nullable=False)
    message=Column(Text,nullable=False)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self):
        return f'<User {self.id}>'

# Create database tables
Base.metadata.create_all(bind=engine)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db_session.query(User).get(user_id)

socketio = SocketIO(app, cors_allowed_origins="*")

connected_clients = {}

@socketio.on('connect')
def handle_connect():
    custom_id = request.args.get('id')
    if custom_id:
        connected_clients[custom_id] = request.sid
    online_users_list = list(connected_clients.keys())
    socketio.emit('online_users',online_users_list)
        # print(f"User connected with ID: {custom_id}, SID: {request.sid}")


@socketio.on('disconnect')
def handle_disconnect():
    custom_id = None
    for cid, sid in connected_clients.items():
        if sid == request.sid:
            custom_id = cid
            break
    if custom_id:
        del connected_clients[custom_id]
        print(f"User disconnected with ID: {custom_id}")
    socketio.emit('user_disconnected',custom_id)


@socketio.on('message')
def handle_message(data):
    target_id = data.get('to')
    sender = data.get('from')
    receiver = data.get('to')
    message = data.get('message')
    id=data.get('id')
    print(id)
    print(request.sid,'here')

    print(f"Received message from {sender} to {receiver}: {message}")

    response = {'success': False,'id':id}
    if target_id in connected_clients:
        target_sid = connected_clients[target_id]
        
        def ack_callback():
            print('Acknowledgment received')
            response['success'] = True
            print(request.sid)
            socketio.emit('ack', response, to=request.sid)
            
        
        socketio.emit('message', {'text': message, 'from': sender}, to=target_sid, callback=ack_callback)

    new_message = Chats(sender=sender, receiver=receiver, message=message)
    db_session.add(new_message)
    db_session.commit()

    # emit('ack', response, to=request.sid)
    

    # print(f"Message from {data.get('from')} to {target_id}: {data.get('message')}")

    # socketio.send(data)

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # print(data,'here')
    username = data.get('username')
    password = data.get('password')
    user = db_session.query(User).filter_by(username=username).first()

    if user and user.password == password:
        login_user(user)
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    existing_user = db_session.query(User).filter_by(username=username).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    else:
        new_user = User(username=username, password=password)
        db_session.add(new_user)
        db_session.commit()
        return jsonify({'success': True})

# Logout route
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})
@app.route('/users',methods=['GET'])
def all_users():
    users = db_session.query(User).all()
    users_list = [{'id': user.id, 'username': user.username} for user in users]
    return jsonify(users_list)

@app.route('/message',methods=['POST'])
def fetch_messages():
    data=request.get_json()
    sender=data.get('sender')
    fetch_messages=db_session.query(Chats).filter( or_(
        Chats.sender == sender,
        Chats.receiver == sender
    )).all()
    messages = [{'id': chat.id, 'timestamp': chat.timestamp, 'sender': chat.sender, 'receiver': chat.receiver, 'message': chat.message} for chat in fetch_messages]
    # print(messages)
    return jsonify(messages)

if __name__ == '__main__':
    socketio.run(app, debug=True,host="192.168.229.1")
