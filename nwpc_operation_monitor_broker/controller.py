from nwpc_operation_monitor_broker import socketio, app

from flask.ext.socketio import emit


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected', 'count': 0})

@socketio.on('my event', namespace='/test')
def test_message(message):
    emit('my response', {'data': message['data'], 'count': 2})