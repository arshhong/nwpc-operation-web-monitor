#def application(environ, start_response):
#    start_response('200 ok', [('content-type', 'text/plain')])
#    return ['Hello, SAE!']

import sae

from nwpc_monitor import app

application = sae.create_wsgi_app(app)