from flask import jsonify

from hpcstatistics import hpcloadleveler

from nwpc_operation_web_monitor.api import api_app


@api_app.route('/monitor/llq')
def get_llq_info():
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'

    llq_info = hpcloadleveler.get_llq(hostname,port,username,password)
    result = {
        'app': 'npwc-operation-web-monitor',
        'data': llq_info['total']
    }
    return jsonify(result)