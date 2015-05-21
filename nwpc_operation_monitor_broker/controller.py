from nwpc_operation_monitor_broker import socketio, app
from hpcstatistics import hpcloadleveler, hpcquota

from flask import json, request, jsonify,render_template
from flask.ext.socketio import emit


@app.route('/')
def get_index_page():
    return render_template('index.html')


@app.route('/api/v1/hpc/loadleveler/info', methods=['POST'])
def get_hpc_llq_info():
    r = request
    hpc_llq_info_message = json.loads(request.form['message'])
    print "Receive llq info:", hpc_llq_info_message
    socketio.emit('send_llq_info', hpc_llq_info_message, namespace='/hpc')
    result = {
        'status': 'ok'
    }
    return jsonify(result)


@app.route('/api/v1/hpc/loadleveler/info/detail', methods=['GET'])
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


@app.route('/api/v1/hpc/sms/info', methods=['POST'])
def get_sms_info():
    r = request
    hpc_sms_info_message = json.loads(request.form['message'])
    print "Receive sms info"
    socketio.emit('send_sms_info', hpc_sms_info_message, namespace='/hpc')
    result = {
        'status': 'ok'
    }
    return jsonify(result)


@socketio.on('connect', namespace='/hpc')
def hpc_connect():
    emit('connect_response', {'data': 'Connected', 'app': 'nwpc-operation-monitor-broker'})


@socketio.on('llq_detail_info', namespace='/hpc')
def hpc_llq_detail_info(message_string):
    message = message_string
    query_user = message['data']['query_user']

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
    response = result
    emit('llq_detail_info', response, namespace='/hpc')


@socketio.on('user_disk_usage', namespace='/hpc')
def hpc_user_disk_usage(message_string):
    print 'hpc_user_disk_usage'
    message = message_string
    query_user = message['data']['query_user']
    query_password = message['data']['query_password']

    hostname = '10.20.49.124'
    port = 22
    username = query_user
    password = query_password

    user_disk_usage = hpcquota.get_cmquota_by_user(hostname, port, username, password)

    if 'error' in user_disk_usage:
        result = {
            'app': 'nwpc_operation_monitor_broker',
            'error': user_disk_usage['error'],
            'error_msg': user_disk_usage['error_msg']
        }
        emit('user_disk_usage', result, namespace='/hpc')
        return

    result = {
        'app': 'nwpc_operation_monitor_broker',
        'data': {
            'query_user': query_user,
            'user_disk_usage': user_disk_usage
        }
    }
    response = result
    emit('user_disk_usage', response, namespace='/hpc')