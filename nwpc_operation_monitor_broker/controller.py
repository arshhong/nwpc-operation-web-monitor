from nwpc_operation_monitor_broker import socketio, app

from flask.ext.socketio import emit


@socketio.on('connect', namespace='/hpc')
def test_connect():
    emit('connect_response', {'data': 'Connected', 'app': 'nwpc-operation-monitor-broker'})