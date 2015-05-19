from nwpc_operation_monitor_broker import app, socketio


def runserver():
    port = 5101
    socketio.run(app, host='0.0.0.0', port=port)

if __name__ == '__main__':
    runserver()
