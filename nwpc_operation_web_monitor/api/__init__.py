from datetime import date, datetime, time, timedelta

from flask import Blueprint, jsonify

api_app = Blueprint('api_app', __name__, template_folder='template')

from nwpc_operation_web_monitor.api import api_hpc_monitor