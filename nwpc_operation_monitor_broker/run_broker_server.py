#!/usr/bin/env python
import os
import sys
if os.environ.has_key('NWPC_OPERATION_WEB_MONITOR_BASE'):
    sys.path.append(os.environ['NWPC_OPERATION_WEB_MONITOR_BASE'])

from nwpc_operation_monitor_broker import app, socketio


def runserver():
    port = 5101
    socketio.run(app, host='0.0.0.0', port=port)

if __name__ == '__main__':
    runserver()
