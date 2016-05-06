from flask import json,request,jsonify

from hpcstatistics import hpcloadleveler
from nwpc_operation_monitor_broker import socketio
from nwpc_operation_monitor_broker.api import api_app

@api_app.route('/hpc/loadleveler/info', methods=['POST'])
def get_hpc_llq_info():
    r = request
    hpc_llq_info_message = json.loads(request.form['message'])
    print "Receive llq info:", hpc_llq_info_message
    socketio.emit('send_llq_info', hpc_llq_info_message, namespace='/hpc')
    result = {
        'status': 'ok'
    }
    return jsonify(result)


@api_app.route('/hpc/loadleveler/info/detail', methods=['GET'])
def get_hpc_llq_detail_info():
    r = request
    query_user = request.args.get('query_user', None)

    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    llq_result = hpcloadleveler.get_job_detail_info(hostname, port, username, password, query_user)

    result = {
        'app': 'nwpc_operation_monitor_broker',
        'data': {
            'query_user': query_user,
            'llq_detail_info': llq_result
        }
    }
    return jsonify(result)
