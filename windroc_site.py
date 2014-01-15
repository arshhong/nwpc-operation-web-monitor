from flask import Flask, render_template, url_for
app = Flask(__name__)

@app.route('/work/monitor')
def work_system_monitor():
    from hpcstatistics import hpcquota
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'
    quota_result = hpcquota.get_cmquota_by_user(hostname,port,username,password)
    import json
    quota_result = json.loads(quota_result)
    #print quota_result
    for a_quota_file_system in quota_result['file_systems']:
        soft_quota = float(a_quota_file_system['current_usage'])/a_quota_file_system['soft_limit']*100
        a_quota_file_system['soft_quota'] = float("%.2f"%soft_quota)
        hard_quota = float(a_quota_file_system['current_usage'])/a_quota_file_system['hard_limit']*100
        a_quota_file_system['hard_quota'] = float('%.2f'%hard_quota)

    return render_template('work_system_monitor.html', quota_result=quota_result)

@app.route('/work')
def work_index():
    return render_template('work.html')

@app.route('/')
def hello_world():
    return render_template('index.html')

@app.route('/api/system/quota')
def get_system_quota():
    from hpcstatistics import hpcquota
    hostname = '10.20.49.124'
    port = 22
    username = 'wangdp'
    password = 'perilla'
    return hpcquota.get_cmquota_by_user(hostname,port,username,password)

if __name__ == '__main__':
    app.debug = True
    app.run()