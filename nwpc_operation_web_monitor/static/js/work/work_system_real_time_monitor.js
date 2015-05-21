/**
 * For work_system_real_time_monitor.html
 */


var socket = io.connect('http://127.0.0.1:5101/hpc');
socket.on('connect', function() {
    console.log('I\'m connected!');
});

var LoadlevelerTotalJobBoard = React.createClass({
    getInitialState: function() {
        return {total_job_number: 'Unknown'};
    },
    componentDidMount: function(){
        var component = this;
        socket.on('send_llq_info', function(msg){
            var llq_total_info = msg.total;
            //console.log('send_llq_info in component');
            var total = parseInt(llq_total_info.in_queue);
            var waiting = parseInt(llq_total_info.waiting);
            var held = parseInt(llq_total_info.held);
            var running = parseInt(llq_total_info.running);
            var pending = parseInt(llq_total_info.pending);
            var preempted = parseInt(llq_total_info.preempted);
            component.setState({
                total_job_number: total
            });
        });
    },
    render: function(){
        return (
            <div className="loadlevelerTotalJobBoard">
                <div className="total_llq_job_number">{this.state.total_job_number}</div>
                <div className="main_board_subtitle">job step(s) in loadleveler queue</div>
            </div>
        )
    }
});

var LoadlevelerTypeChartBoard = React.createClass({
    getInitialState: function() {
        var component = this;
        var llq_type_chart_svg_attr = {
            height: 180,
            width: 550
        };
        var llq_type_chart_label_width = 120;
        var margin = 10;
        var llq_type_chart_attr = {
            max_width: llq_type_chart_svg_attr.width - llq_type_chart_label_width - margin,
            bar_height: 20,
            bar_step: 30
        };
        return {
            llq_info: [
                {name: 'total', value: 0},
                {name: 'waiting', value: 0},
                {name: 'pending', value: 0},
                {name: 'running', value: 0},
                {name: 'held', value: 0},
                {name: 'preempted', value: 0}
            ],
            llq_type_chart_attr: llq_type_chart_attr,
            llq_type_chart_label_width: llq_type_chart_label_width,
            margin: margin,
            llq_type_chart_svg_attr: llq_type_chart_svg_attr
        }
    },
    componentDidMount: function(){
        var component = this;

        var llq_type_chart_svg = d3.select(this.getDOMNode())
            .attr('id', 'llq_type_chart_2')
            .attr('height', this.state.llq_type_chart_svg_attr.height)
            .attr('width', this.state.llq_type_chart_svg_attr.width);
        var llq_type_chart_bar_group = llq_type_chart_svg;
        var llq_type_chart_label_group = llq_type_chart_svg;

        var bar_chart_label_data = llq_type_chart_label_group.selectAll('.llq-type-label').data(this.state.llq_info);
        var bar_chart_label_enter = bar_chart_label_data
            .enter()
            .append('text')
            .attr('x', this.state.llq_type_chart_label_width - this.state.margin)
            .attr('y', function(d,i){
                return i*component.state.llq_type_chart_attr.bar_step + component.state.llq_type_chart_attr.bar_height;
            })
            .attr('text-anchor', 'end')
            .style('font-size', this.state.llq_type_chart_attr.bar_height)
            .text(function(d){ return d.name; });

        socket.on('send_llq_info', function(msg){
            var llq_total_info = msg.total;
            var total = parseInt(llq_total_info.in_queue);
            var waiting = parseInt(llq_total_info.waiting);
            var held = parseInt(llq_total_info.held);
            var running = parseInt(llq_total_info.running);
            var pending = parseInt(llq_total_info.pending);
            var preempted = parseInt(llq_total_info.preempted);

            component.setState({
                llq_info: [
                    {name: 'total', value: total},
                    {name: 'waiting', value: waiting},
                    {name: 'pending', value: pending},
                    {name: 'running', value: running},
                    {name: 'held', value: held},
                    {name: 'preempted', value: preempted}
                ]
            });
        });

    },
    shouldComponentUpdate: function(nextProps, nextState){
        var component = this;

        var llq_type_chart_svg = d3.select(this.getDOMNode());
        var llq_type_chart_bar_group = llq_type_chart_svg;
        var llq_type_chart_label_group = llq_type_chart_svg;

        var max_number = d3.max(nextState.llq_info, function(d){ return d.value; });
        var x_scale = d3.scale.linear().domain([0, max_number]).range([0, this.state.llq_type_chart_attr.max_width]);
        var bar_chart_data = llq_type_chart_bar_group.selectAll('.llq-type-bar').data(nextState.llq_info);
        var bar_chart_data_enter = bar_chart_data
            .enter()
            .append('rect')
            .attr('class', 'llq-type-bar')
            .attr('height', this.state.llq_type_chart_attr.bar_height)
            .attr('width', function(d){
                return x_scale(d.value);
            })
            .attr('x', this.state.llq_type_chart_label_width)
            .attr('y', function(d,i){
                return i*component.state.llq_type_chart_attr.bar_step;
            })
            .attr('fill', '#ddd');

        var bar_chart_data_modify = bar_chart_data
            .transition()
            .duration(800)
            .attr('width', function(d){
                return x_scale(d.value);
            });
        return false;
    },
    render: function(){
        return (
            <svg></svg>
        )
    }
});

var LoadlevelerUserJobCountListBoard = React.createClass({
    getInitialState: function() {
        return {
            llq_jobs: null
        }
    },
    componentDidMount: function() {
        var component = this;
        socket.on('send_llq_info', function(msg) {
            var llq_jobs = msg.jobs;
            component.setState({
                llq_jobs: llq_jobs
            });
        });
    },
    render: function() {
        var user_job_count_nodes = '';
        var llq_jobs_map = d3.map();
        if(this.state.llq_jobs) {
            this.state.llq_jobs.forEach(function (element, index, array) {
                var owner_name = element.owner;
                if (llq_jobs_map.get(owner_name) == undefined) {
                    llq_jobs_map.set(owner_name, [element]);
                } else {
                    llq_jobs_map.get(owner_name).push(element);
                }
            });
            var llq_user_job_count_list = [];
            llq_jobs_map.forEach(function (d) {
                llq_user_job_count_list.push({
                    owner: d,
                    count: llq_jobs_map.get(d).length
                });
            });
            llq_user_job_count_list.sort(function (a, b) {
                if (a.count > b.count) {
                    return 1;
                }
                if (a.count < b.count) {
                    return -1;
                }
                return 0;
            }).reverse();

            // 只显示前10个用户
            llq_user_job_count_list.splice(10, Number.MAX_VALUE);

            user_job_count_nodes = llq_user_job_count_list.map(function (user_job_count) {
                var user = user_job_count.owner;
                var count = user_job_count.count;
                return (
                    <div className="row">
                        <div className="col-md-2">{user}:</div>
                        <div className="col-md-2">{count}</div>
                    </div>
                )
            });
        }
        return (
            <div className="loadlevelerUserJobCountListBoard">
                <div className="row">作业最多的十位用户</div>
                <div className="row">
                    <div className="col-md-12">
                    {user_job_count_nodes}
                    </div>
                </div>
            </div>
        )
    }
});



var SmsServerStatusBoard = React.createClass({
    getInitialState: function() {
        return {
            sms_server_info: null
        }
    },
    componentDidMount: function() {
        var component = this;
        socket.on('send_sms_info', function(message){
            // console.log(message);
            component.setState({
                sms_server_info: message
            })
        })
    },
    render : function(){
        var sms_server_nodes = '';
        if (this.state.sms_server_info) {
            sms_server_nodes = this.state.sms_server_info.map(function (server_info) {
                var sms_server_name = server_info.sms_server.sms_name;
                var sms_server_status;
                var sms_server_label_class;
                if (server_info.ping_result.hasOwnProperty('error')) {
                    sms_server_status = 'Error';
                    sms_server_label_class = 'label label-danger';
                } else {
                    sms_server_status = 'Ok';
                    sms_server_label_class = 'label label-success';
                }
                return (
                    <tr>
                        <td>{sms_server_name}</td>
                        <td><span className={sms_server_label_class} >{sms_server_status}</span></td>
                    </tr>
                )
            });
        }

        return (
            <div className="smsServerStatusBoard">
                <table className="table">
                    <tbody>
                        {sms_server_nodes}
                    </tbody>
                </table>
            </div>
        );
    }
});


var UserDiskUsageQueryBox = React.createClass({
    getInitialState: function() {
        return {
            user_disk_usage: null
        }
    },
    componentDidMount: function() {
        var component = this;
        socket.on('user_disk_usage', function(message){
            if(message.hasOwnProperty('error')){
                console.log(message.error_msg);
                return;
            }
            component.setState({
                user_disk_usage: message.data.user_disk_usage
            })
        })
    },
    handleQueryClick: function(e){
        e.preventDefault();
        var query_user = React.findDOMNode(this.refs.query_user).value.trim();
        var query_password = React.findDOMNode(this.refs.query_password).value;
        if(!query_user){
            query_user = "nwp_qu";
        }

        var message={
            app:'npwc_operation_web_monitor',
            data:{
                query_user: query_user,
                query_password: query_password
            }
        };
        socket.emit('user_disk_usage', message);

    },
    render: function() {
        var disk_usage_nodes;
        if( this.state.user_disk_usage == null){
            disk_usage_nodes = '';
        } else {
            var disk_usage= this.state.user_disk_usage;
            console.log(disk_usage);
            disk_usage_nodes = disk_usage.file_systems.map(function(file_system){
                var current_soft_percent = file_system['current_usage']/
                    file_system['soft_limit']*100;
                current_soft_percent = Number(current_soft_percent.toFixed(2));

                var current_hard_percent = file_system['current_usage']/
                    file_system['hard_limit']*100;
                current_hard_percent = Number(current_hard_percent.toFixed(2));
                return (
                    <tr>
                        <td>{file_system.file_system}</td>
                        <td>{file_system.quota_type}</td>
                        <td>{current_soft_percent}%</td>
                        <td>{current_hard_percent}%</td>
                    </tr>
                );
            });
        }
        return (
            <div className="userDiskUsageQueryBox">
                <div class="row">
                    <form className="form-inline">
                        <div className="form-group">
                            <label>用户名</label>
                            <input type="text" className="form-control" ref="query_user" />
                            <label>密码</label>
                            <input type="password" className="form-control" ref="query_password" />
                        </div>
                        <button type="button" className="btn btn-default" onClick={this.handleQueryClick}>查询</button>
                    </form>
                </div>
                <div class="row">
                    <table className="table">
                        <thead>
                            <tr>
                                <td>文件系统</td>
                                <td>类型</td>
                                <td>软限制百分比</td>
                                <td>硬限制百分比</td>
                            </tr>
                        </thead>
                        <tbody>
                            {disk_usage_nodes}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});


var UserJobQueryBox = React.createClass({
    getInitialState: function() {
        return {
            llq_detail_info: null
        }
    },
    componentDidMount: function() {
        var component = this;
        socket.on('llq_detail_info', function(message){
            console.log(message);
            component.setState({
                llq_detail_info: message.data.llq_detail_info
            })
        })
    },
    handleQueryClick: function(e){
        e.preventDefault();
        var query_user = React.findDOMNode(this.refs.query_user).value.trim();
        if(!query_user){
            query_user = "nwp_qu";
        }

        var message={
            app:'npwc_operation_web_monitor',
            data:{
                query_user: query_user
            }
        };
        socket.emit('llq_detail_info', message);

    },
    render: function() {
        var jobs_nodes;
        if( this.state.llq_detail_info == null){
            jobs_nodes = '';
        } else {
            var llq_jobs= this.state.llq_detail_info.jobs;
            jobs_nodes = llq_jobs.map(function(job){
                var job_id = job.id;
                var job_status = job.st;
                var job_cmd = '';
                if(job.detail!=null) {
                    if (job.detail.hasOwnProperty('Status')) {
                        job_status = job.detail.Status;
                    }
                    if (job.detail.hasOwnProperty('Executable') && job.detail.Executable!=null) {
                        job_cmd = job.detail.Executable;
                    } else if (job.detail.hasOwnProperty('Cmd') && job.detail.Cmd!=null){
                        job_cmd = job.detail.Cmd;
                    }
                }
                return (
                    <tr>
                        <td>{ job_id }</td>
                        <td>{ job_status }</td>
                        <td>{ job_cmd }</td>
                    </tr>
                )
            });
        }
        return (
            <div className="userJobQueryBox">
                <div class="row">
                    <form className="form-inline">
                        <div className="form-group">
                            <label>用户名</label>
                            <input type="text" className="form-control" placeholder="nwp" ref="query_user" />
                        </div>
                        <button type="button" className="btn btn-default" onClick={this.handleQueryClick}>查询</button>
                    </form>
                </div>
                <div class="row">
                    <table className="table">
                        <tbody>
                            {jobs_nodes}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

React.render(
    <LoadlevelerTotalJobBoard />,
    document.getElementById('llq_total_job_board')
);

React.render(
    <LoadlevelerTypeChartBoard />,
    document.getElementById('llq_type_chart_board')
);

React.render(
    <LoadlevelerUserJobCountListBoard />,
    document.getElementById('llq_user_job_count_board')
);

React.render(
    <UserDiskUsageQueryBox />,
    document.getElementById('user_disk_usage_query_container')
);

React.render(
    <UserJobQueryBox />,
    document.getElementById('user_job_query_container')
);

React.render(
    <SmsServerStatusBoard />,
    document.getElementById('sms_server_status_container')
);