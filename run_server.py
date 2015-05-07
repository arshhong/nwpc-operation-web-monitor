import os
from nwpc_operation_web_monitor import app


def runserver():
    port = int(os.environ.get('PORT', 6000))
    app.run(host='0.0.0.0', port=port)

if __name__ == '__main__':
    runserver()
