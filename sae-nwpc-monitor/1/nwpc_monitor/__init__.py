#!/usr/bin/env python
# coding=utf-8
from flask import Flask, render_template, json, request, jsonify
from datetime import datetime
import pylibmc as memcache

mc = memcache.Client()

app = Flask(__name__)
app.secret_key = 'A0Zrdgj/3yX R~XHH!jmN]LWX/,?RT'

app.debug = True


def get_cache_key(key):
    return mc.get(key)


def get_sms_status_for_server_list(sms_server_list):
    sms_status_data = []
    current_datetime = datetime.now()
    current_time = current_datetime.strftime('%Y-%m-%d %H:%M:%S')
    for a_sms_server in sms_server_list:
        sms_user = a_sms_server['sms_user']
        sms_name = a_sms_server['sms_name']
        key = "hpc/sms/{sms_user}/{sms_name}/status".format(sms_user=sms_user, sms_name=sms_name)
        value = get_cache_key(key)
        if value is not None:
            value = json.loads(value)
            data_collect_time_string = value['time']
            data_collect_datetime = datetime.strptime(data_collect_time_string, "%Y-%m-%dT%H:%M:%S.%f")
            value['time'] = data_collect_datetime.strftime('%Y-%m-%d %H:%M:%S')
            delay_time = current_datetime - data_collect_datetime
            delay_time_hours, delay_time_remainder = divmod(delay_time.seconds, 3600)
            delay_time_minutes, delay_time_seconds = divmod(delay_time_remainder, 60)
            value['delay_time'] = '%02d:%02d:%02d' % (delay_time_hours, delay_time_minutes, delay_time_seconds)

        sms_status_data.append(value)

    print (sms_status_data)

    return render_template('sms_status.html', current_time=current_time, sms_status_data=sms_status_data)


@app.route('/')
def get_sms_status_page():
    sms_server_list = [
        {'sms_name': 'nwpc_op', 'sms_user':'nwp_xp'},
        {'sms_name': 'nwpc_qu', 'sms_user':'nwp_xp'},
        {'sms_name': 'eps_nwpc_qu', 'sms_user':'nwp_xp'},
        {'sms_user': 'nwp_xp', 'sms_name': 'draw_ncl'},
        {'sms_user': 'nwp_xp', 'sms_name': 'nwpc_sp'}
    ]
    return get_sms_status_for_server_list(sms_server_list)


@app.route('/nwp_sp')
def get_sms_status_page_for_nwp_sp():
    sms_server_list = [
        {'sms_user': 'nwp_xp', 'sms_name': 'nwpc_sp'}
    ]
    return get_sms_status_for_server_list(sms_server_list)


@app.route('/nwp_vfy')
def get_sms_status_page_for_nwp_vfy():
    sms_server_list = [
        {'sms_user': 'nwp_vfy', 'sms_name': 'nwpc_nwp_vfy'}
    ]
    return get_sms_status_for_server_list(sms_server_list)


@app.route('/api/v1/hpc/sms/status', methods=['POST'])
def get_sms_status():
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

    # 保存到本地缓存
    key = "hpc/sms/{sms_user}/{sms_name}/status".format(sms_user=sms_user, sms_name=sms_name)
    mc.set(key, json.dumps(message_data))
    result = {
        'status': 'ok'
    }
    return jsonify(result)