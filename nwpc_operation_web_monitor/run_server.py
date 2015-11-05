#!/usr/bin/env python
import os
import sys
if os.environ.has_key('NWPC_OPERATION_WEB_MONITOR_BASE'):
    sys.path.append(os.environ['NWPC_OPERATION_WEB_MONITOR_BASE'])

from nwpc_operation_web_monitor import app


def runserver():
    port = int(os.environ.get('NWPC_OPERATION_WEB_MONITOR_SERVER_PORT', 5100))
    app.run(host='0.0.0.0', port=port)

if __name__ == '__main__':
    runserver()
