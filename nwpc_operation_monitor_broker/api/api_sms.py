# coding=utf-8
import datetime

from nwpc_operation_monitor_broker import socketio
from nwpc_operation_monitor_broker.api import api_app, redis_client
from flask import request, json, jsonify
import requests


WARING_POST_URL = 'https://oapi.dingtalk.com/message/send?access_token={dingtalk_access_token}'


@api_app.route('/hpc/sms/info', methods=['POST'])
def get_sms_info():
    r = request
    hpc_sms_info_message = json.loads(request.form['message'])
    print ("Receive sms info")
    socketio.emit('send_sms_info', hpc_sms_info_message, namespace='/hpc')
    result = {
        'status': 'ok'
    }
    return jsonify(result)


@api_app.route('/hpc/sms/status', methods=['POST'])
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
    print (key)
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
                    print ('Get aborted. Pushing warning message...')

                    # 获取 access token
                    access_token_key = "dingtalk_access_token"
                    dingtalk_access_token = redis_client.get(access_token_key)
                    if dingtalk_access_token is None:
                        get_dingtalk_access_token()
                        dingtalk_access_token = redis_client.get(access_token_key)

                    sms_server_name=server_status['name']

                    error_datetime = datetime.datetime.strptime(message_data['time'], "%Y-%m-%dT%H:%M:%S.%f")

                    warning_post_url = WARING_POST_URL.format(
                        dingtalk_access_token=dingtalk_access_token
                    )
                    warning_post_message = {
                        "touser":"manager4941|01496812279575",
                        #"touser":"manager4941|member20",
                        #"touser":"manager4941|02541110667182",
                        #"touser":"manager4941|02185968404994",
                        #"touser":"manager4941",
                        "agentid":"4078086",
                        "msgtype":"oa",
                        "oa": {
                            "message_url": "http://nwpcmonitor.sinaapp.com",
                            "head": {
                                "bgcolor": "ffff0000",
                                "text": "业务系统报警"
                            },
                            "body":{
                                "title":"业务系统运行出错",
                                "content":"{sms_server_name} 出错，请查看".format(sms_server_name=sms_server_name),
                                "form":[
                                    {
                                        "key": "{sms_server_name} : ".format(sms_server_name=sms_server_name),
                                        "value": "aborted"
                                    },
                                    {
                                        "key": "日期 : ",
                                        "value": "{error_date}".format(error_date=error_datetime.strftime("%Y-%m-%d"))
                                    },
                                    {
                                        "key": "时间 : ",
                                        "value": "{error_time}".format(error_time=error_datetime.strftime("%H:%M:%S"))
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
                    print (result.json())

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

@api_app.route('/dingtalk/access_token/get', methods=['GET'])
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
    print (response_json)
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