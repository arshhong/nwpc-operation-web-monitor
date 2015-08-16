# coding=utf-8
from nwpc_operation_monitor_broker import socketio, app
from hpcstatistics import hpcloadleveler, hpcquota

from flask import json, request, jsonify,render_template
from flask.ext.socketio import emit
import redis

import requests

REDIS_HOST = '10.28.32.175'
redis_client = redis.Redis(host=REDIS_HOST)

#dingding_access_token = '10509dc21332395bb01203467b18d7f4'


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


@app.route('/api/v1/hpc/sms/status', methods=['POST'])
def get_sms_status():
    """
    接收外部发送来的 SMS 服务器的状态，将其保存到本地缓存，并发送到外网服务器
    :return:
    """

    r = request
    message = json.loads(request.form['message'])

    if 'error' in message:
        result = {
            'status': 'ok'
        }
        return jsonify(result)

    message_data = message['data']
    sms_name = message_data['sms_name']
    sms_user = message_data['sms_user']

    # 检测是否需要推送警告信息
    key = "hpc/sms/{sms_user}/{sms_name}/status".format(sms_user=sms_user, sms_name=sms_name)
    print key
    # 获取服务器'/' 的状态
    if len(message_data["status"]) >0:
        server_status = message_data["status"][0] # TODO：使用循环查找
        if server_status['status'] == 'abo':
            cached_message_string = redis_client.get(key)
            if cached_message_string is not None:
                cached_message = json.loads(cached_message_string)
                previous_server_status = cached_message['status'][0]
                if previous_server_status['status'] != 'abo':
                    # 发送推送警告
                    print 'Get aborted. Pushing warning message...'

                    # 获取 access token
                    access_token_key = "dingtalk_access_token"
                    dingtalk_access_token = redis_client.get(access_token_key)
                    if dingtalk_access_token is None:
                        get_dingtalk_access_token()
                        dingtalk_access_token = redis_client.get(access_token_key)

                    sms_server_name=server_status['name']
                    warning_post_url = 'https://oapi.dingtalk.com/message/send?access_token={dingtalk_access_token}'.format(
                        dingtalk_access_token=dingtalk_access_token
                    )
                    warning_post_message = {
                        "touser":"wangdp",
                        "agentid":"4078086",
                        "msgtype":"oa",
                        "oa": {
                            "message_url": "http://nwpcmonitor.sinaapp.com",
                            "head": {
                                "bgcolor": "ffff0000",
                                "text": "业务系统运行状态"
                            },
                            "body":{
                                "title":"系统运行出错",
                                "content":"业务系统出错，请查看",
                                "form":[
                                    {
                                        "key": "{sms_server_name} :".format(sms_server_name=sms_server_name),
                                        "value": "aborted"
                                    },
                                    {
                                        "key": "时间",
                                        "value": "{timestamp}".format(timestamp=message_data['time'])
                                    }
                                ]
                            }
                        }
                    }
                    warning_post_headers = {'content-type': 'application/json'}
                    warning_post_data = json.dumps(warning_post_message)

                    result = requests.post(warning_post_url,
                                           data=warning_post_data,
                                           verify=False,
                                           headers=warning_post_headers)
                    print result.json()

    # 保存到本地缓存
    redis_client.set(key, json.dumps(message_data))

    # 发送给外网服务器
    sae_url = "http://nwpcmonitor.sinaapp.com/api/v1/hpc/sms/status"
    sae_post_data = {
        'message': json.dumps(message)
    }
    requests.post(sae_url, data=sae_post_data)
    result = {
        'status': 'ok'
    }
    return jsonify(result)

@app.route('/api/v1/dingtalk/access_token/get', methods=['GET'])
def get_dingtalk_access_token():
    key = "dingtalk_access_token"
    corp_id = 'ding9f1a223d867202cd'
    corp_secret = 'N-16cm_wfvGcHuweaXoJTTKhBY9NDEFwISHw_UqDnm18WxwLSvMIQwaRDI7z4mXE'

    headers = {'content-type': 'application/json'}
    url = 'https://oapi.dingtalk.com/gettoken?corpid={corp_id}&corpsecret={corp_secret}'.format(
        corp_id=corp_id, corp_secret=corp_secret
    )
    token_response = requests.get(url,verify=False, headers=headers)
    response_json = token_response.json()
    print response_json
    if response_json['errcode'] == 0:
        # 更新 token
        access_token = response_json['access_token']
        redis_client.set(key, access_token)
        result = {
            'status': 'ok',
            'access_token': access_token
        }
    else:
        result = {
            'status': 'error',
            'errcode': response_json['errcode']
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