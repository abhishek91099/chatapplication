from app import create_app, socketio
import app.chat.socket_handlers  # Important to register the events

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0")
