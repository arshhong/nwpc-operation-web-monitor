# coding=utf-8
from gevent import monkey
monkey.patch_all()

from flask import Flask, render_template, request, jsonify, json
from flask.ext.socketio import SocketIO, emit

from hpcstatistics import hpcloadleveler

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'windroc-nwpc-project'
socketio = SocketIO(app)

from api import api_app
app.register_blueprint(api_app, url_prefix="/api/v1")
app.debug=True

from nwpc_operation_monitor_broker import controller

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5101)