from flask_socketio import join_room, leave_room
from app import socketio

@socketio.on('subscribe')
def handle_subscribe(data):
    topic_id = data.get('topic_id')
    if topic_id:
        join_room(f'topic_{topic_id}')

@socketio.on('unsubscribe')
def handle_unsubscribe(data):
    topic_id = data.get('topic_id')
    if topic_id:
        leave_room(f'topic_{topic_id}') 