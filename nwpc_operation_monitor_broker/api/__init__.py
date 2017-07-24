# coding=utf-8
from flask import Blueprint

import redis
REDIS_HOST = '10.28.32.175'
redis_client = redis.Redis(host=REDIS_HOST)

api_app = Blueprint('api_app', __name__, template_folder='template')

import api_loadleveler
import api_sms