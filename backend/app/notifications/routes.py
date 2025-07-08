from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, socketio
from app.models import Topic, Notification, TopicUser

notifications_bp = Blueprint('notifications_bp', __name__)

@notifications_bp.route('/topics', methods=['POST'])
@jwt_required()
def create_topic():
    data = request.get_json()
    topic_name = data.get('name')
    user_id = get_jwt_identity()

    if Topic.query.filter_by(name=topic_name).first():
        return jsonify({'message': 'Topic already exists'}), 409

    new_topic = Topic(name=topic_name, created_by=user_id)
    db.session.add(new_topic)
    db.session.commit()

    return jsonify({'message': 'Topic created successfully', 'topic_id': new_topic.id}), 201

@notifications_bp.route('/topics', methods=['GET'])
def get_topics():
    topics = Topic.query.all()
    return jsonify([{'id': topic.id, 'name': topic.name} for topic in topics])

@notifications_bp.route('/topics/<int:topic_id>/subscribe', methods=['POST'])
@jwt_required()
def subscribe_to_topic(topic_id):
    user_id = get_jwt_identity()
    
    if not Topic.query.get(topic_id):
        return jsonify({'message': 'Topic not found'}), 404

    subscription = TopicUser.query.filter_by(user_id=user_id, topic_id=topic_id).first()
    if subscription:
        return jsonify({'message': 'User already subscribed to this topic'}), 409

    new_subscription = TopicUser(user_id=user_id, topic_id=topic_id)
    db.session.add(new_subscription)
    db.session.commit()

    return jsonify({'message': 'Subscribed successfully'}), 200


@notifications_bp.route('/topics/<int:topic_id>/unsubscribe', methods=['POST'])
@jwt_required()
def unsubscribe_from_topic(topic_id):
    user_id = get_jwt_identity()

    subscription = TopicUser.query.filter_by(user_id=user_id, topic_id=topic_id).first()
    if not subscription:
        return jsonify({'message': 'Not subscribed to this topic'}), 404
    
    db.session.delete(subscription)
    db.session.commit()

    return jsonify({'message': 'Unsubscribed successfully'}), 200


@notifications_bp.route('/topics/<int:topic_id>/subscription', methods=['GET'])
@jwt_required()
def get_subscription_status(topic_id):
    user_id = get_jwt_identity()

    if not Topic.query.get(topic_id):
        return jsonify({'message': 'Topic not found'}), 404

    subscription = TopicUser.query.filter_by(user_id=user_id, topic_id=topic_id).first()
    
    return jsonify({'subscribed': subscription is not None}), 200


@notifications_bp.route('/topics/<int:topic_id>/publish', methods=['POST'])
@jwt_required()
def publish_to_topic(topic_id):
    data = request.get_json()
    message = data.get('message')
    
    if not Topic.query.get(topic_id):
        return jsonify({'message': 'Topic not found'}), 404

    notification = Notification(message=message, topic_id=topic_id)
    db.session.add(notification)
    db.session.commit()

    socketio.emit('new_notification', {'message': message, 'topic': topic_id}, room=f'topic_{topic_id}')

    return jsonify({'message': 'Notification sent'}), 200

@notifications_bp.route('/history', methods=['GET'])
@jwt_required()
def get_notification_history():
    user_id = get_jwt_identity()

    subscriptions = TopicUser.query.filter_by(user_id=user_id).all()
    topic_ids = [sub.topic_id for sub in subscriptions]

    notifications = Notification.query.filter(Notification.topic_id.in_(topic_ids)).order_by(Notification.timestamp.desc()).all()

    return jsonify([{
        'id': n.id,
        'message': n.message,
        'topic': n.topic.name,
        'timestamp': n.timestamp.isoformat()
    } for n in notifications]) 