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
            //console.log('send_llq_info in component');
            var total = parseInt(msg.in_queue);
            var waiting = parseInt(msg.waiting);
            var held = parseInt(msg.held);
            var running = parseInt(msg.running);
            var pending = parseInt(msg.pending);
            var preempted = parseInt(msg.preempted);
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
            var total = parseInt(msg.in_queue);
            var waiting = parseInt(msg.waiting);
            var held = parseInt(msg.held);
            var running = parseInt(msg.running);
            var pending = parseInt(msg.pending);
            var preempted = parseInt(msg.preempted);

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

var LoadlevelerTypeListBoard = React.createClass({
    getInitialState: function() {
        return {
            total: 'unknown',
            waiting: 'unknown',
            pending: 'unknown',
            running: 'unknown',
            held: 'unknown',
            preempted: 'unknown'
        }
    },
    componentDidMount: function() {
        var component = this;
        socket.on('send_llq_info', function(msg) {
            var total = parseInt(msg.in_queue);
            var waiting = parseInt(msg.waiting);
            var held = parseInt(msg.held);
            var running = parseInt(msg.running);
            var pending = parseInt(msg.pending);
            var preempted = parseInt(msg.preempted);
            component.setState({
                total: total,
                waiting: waiting,
                pending: pending,
                running: running,
                held: held,
                preempted: preempted
            })
        });
    },
    render: function() {
        return (
            <div className="loadlevelerTypeListBoard">
                <p>Waiting:{this.state.waiting}</p>
                <p>Pending:{this.state.pending}</p>
                <p>Running:{this.state.running}</p>
                <p>Held:{this.state.held}</p>
                <p>Preempted:{this.state.preempted}</p>
            </div>
        )
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
                return (
                <p> { job.id} {job.st}</p>
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
                    {jobs_nodes}
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
    <LoadlevelerTypeListBoard />,
    document.getElementById('llq_type_list_board')
);

React.render(
    <UserJobQueryBox />,
    document.getElementById('user_job_query_container')
);