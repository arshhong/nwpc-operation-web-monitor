from flask import jsonify

from nwpc_operation_web_monitor.api import api_app


@api_app.route('/monitor/llq')
def get_llq_info():
    result = {'status': 'ok'}
    return jsonify(result)