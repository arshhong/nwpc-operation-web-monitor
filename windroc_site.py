from flask import Flask, render_template, url_for
app = Flask(__name__)

@app.route('/work/monitor')
def work_system_monitor():
    return render_template('work_system_monitor.html')

@app.route('/work')
def work_index():
    return render_template('work.html')

@app.route('/')
def hello_world():
    return render_template('index.html')

if __name__ == '__main__':
    app.debug = True
    app.run()