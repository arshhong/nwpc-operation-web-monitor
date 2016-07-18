/*
    绘制NWPC的数值预报系统运行时间线
 */


var svg_size = {
    'width': 1800,
    'height': 800
};

var chart_option = {
    'start_point': {
        'x': 250,
        'y': 30
    },
    'suite': {
        'interval': 30,
        'bar_height': 20
    }
};

function draw_legend(){
    var legend_svg = d3.select("#time-line-container-legend")
        .append("svg")
        .attr('width', svg_size.width)
        .attr('height', 50);

    var legend_bar = legend_svg.append('g')
        .attr('transform', 'translate('+ chart_option.start_point.x +',0)');

    var legend_enter = legend_bar.selectAll('.legend-item')
        .data(color_domain)
        .enter()
        .append('g')
        .classed('legend-item', true);

    legend_enter.append('rect')
        .attr('x', function(d,i){
            return 120*i;
        })
        .attr('y', function(d,i){
            return 5;
        })
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', function(d,i){
            return color_scale(d)
        });

    legend_enter.append('text')
        .attr('x', function(d,i){
            return 120*i+25;
        })
        .attr('y', function(d,i){
            return 15;
        })
        .attr("dominant-baseline", "central")
        .text(function(d,i){
            return d
        });

    var legend_bar_label = legend_bar.append('text')
        .attr('x', -15)
        .attr('y', 15)
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "end")
        .text("队列名称");


    legend_bar.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "start")
        .text("图中数字为并行队列使用的CPU核心数");
}

draw_legend();


var svg = d3.select("#time-line-container")
    .append("svg")
    .attr('width', svg_size.width)
    .attr('height', svg_size.height);

var current_time = new Date();

var start_hour = d3.timeDay(current_time);
console.log(start_hour);

var next_date = d3.timeDay.offset(start_hour, 1);

var end_hour = d3.timeHour.offset(next_date, 0);

var x_scale = d3.scaleTime()
    .domain([start_hour, end_hour])
    .range([0, svg_size.width - 2*chart_option.start_point.x]);

// axis
var x_axis = d3.axisTop(x_scale)
    .ticks(d3.timeHour.every(1))
    .tickFormat(d3.timeFormat("%H"))
    .tickSizeInner( -(system_run_time_data.length * chart_option.suite.interval - chart_option.suite.interval/2) );

var axis_group = svg.append("g")
    .attr('transform', 'translate('+ chart_option.start_point.x +','+ chart_option.start_point.y + ')')
    .classed('axis', true)
    .call(x_axis);

var y_scale = d3.scaleLinear()
    .domain([0, system_run_time_data.length-1])
    .range([chart_option.suite.interval/2, (system_run_time_data.length-1)*chart_option.suite.interval + chart_option.suite.interval/2]);

var y_axis = d3.axisLeft(y_scale)
    .ticks(system_run_time_data.length-1)
    .tickFormat("")
    .tickSizeInner( -(svg_size.width - 2*chart_option.start_point.x) );

var y_axis_group = svg.append("g")
    .attr('transform', 'translate('+ chart_option.start_point.x +','+ chart_option.start_point.y + ')')
    .classed('axis', true)
    .call(y_axis);

// time bar
var time_bar_group = svg.append("g")
    .attr('transform', 'translate('+ chart_option.start_point.x +','+ chart_option.start_point.y + ')');


// suite
var suite_data = time_bar_group.selectAll('.suite')
    .data(system_run_time_data);

var suite_data_enter = suite_data
    .enter()
    .append('g')
    .attr('transform', function(d, i){
        return 'translate(0, '+ (chart_option.suite.interval*i) +')'
    })
    .classed('suite', true);

// suite label
var suite_label = suite_data_enter
    .append('text')
    .attr('x', function(d,i){
        return -10
    })
    .attr('y', function(d,i){
        return chart_option.suite.interval/2;
    })
    .text(function(d,i){
        return d.name;
    })
    .attr('text-anchor', 'end')
    .attr("dominant-baseline", "central");


// time level item
var time_level_data = suite_data_enter
    .selectAll('.time-level-item')
    .data(function(d){ return d.run_times});

var time_level_enter = time_level_data
    .enter()
    .append("g")
    .classed('time-level-item', true);

time_level_enter
    .append('rect')
    .attr('x', function(d, i){
        var local_start_time = d.start_time;
        var hour = parseInt(local_start_time.substr(0, 2));
        var minute = parseInt(local_start_time.substr(3, 2));
        var current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);

        return x_scale(current_start_time);
    })
    .attr('y', function(d, i){
        return (chart_option.suite.interval - chart_option.suite.bar_height)/2;
    })
    .attr('width', function(d,i){
        var local_start_time = d.start_time;
        var hour = parseInt(local_start_time.substr(0, 2));
        var minute = parseInt(local_start_time.substr(3, 2));
        var current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);

        var local_end_time = d.end_time;
        var end_hour = local_end_time.substr(0, 2);
        var end_minute = local_end_time.substr(3, 2);
        var current_end_time;
        if(end_hour < hour)
        {
            current_end_time = d3.timeMinute.offset(d3.timeHour.offset(next_date, end_hour), end_minute);
        }
        else{
            current_end_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, end_hour), end_minute);
        }

        var bar_width = x_scale(current_end_time) - x_scale(current_start_time);

        return bar_width>=5?bar_width:5;
    })
    .attr('height', chart_option.suite.bar_height)
    //.style('stroke-width', '1px')
    //.style('stroke', 'black');
    .style('fill', function(d,i){
        if (! 'class' in d) {
            d.class = 'unknown';
        }
        return color_scale(d.class)
    });


time_level_enter
    .filter(function(d,i){ return d.label != '' })
    .append('text')
    .attr('x', function(d, i){
        var local_end_time = d.end_time;
        var end_hour = local_end_time.substr(0, 2);
        var end_minute = local_end_time.substr(3, 2);
        var current_end_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, end_hour), end_minute);
        return x_scale(current_end_time) + 2;
    })
    .attr('y', function(d, i){
        return chart_option.suite.interval/2;
    })
    .text(function(d, i){
        return d.label;
    })
    .attr("dominant-baseline", "central")
    .attr("text-anchor", "start");

// parallel time
var task_level_data = time_level_enter
    .selectAll('.task-level-item')
    .data(function(d){
        if('run_times' in d)
            return d.run_times;
        else
            return []
    });

var task_level_enter = task_level_data
    .enter()
    .append('g')
    .classed('task-level-item', true);

task_level_enter
    .append('rect')
    .attr('x', function(d, i){
        var local_start_time = d.start_time;
        var hour = parseInt(local_start_time.substr(0, 2));
        var minute = parseInt(local_start_time.substr(3, 2));
        var current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);

        return x_scale(current_start_time);
    })
    .attr('y', function(d, i){
        return (chart_option.suite.interval - chart_option.suite.bar_height)/2;
    })
    .attr('width', function(d,i){
        var local_start_time = d.start_time;
        var hour = parseInt(local_start_time.substr(0, 2));
        var minute = parseInt(local_start_time.substr(3, 2));
        var current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);

        var local_end_time = d.end_time;
        var end_hour = local_end_time.substr(0, 2);
        var end_minute = local_end_time.substr(3, 2);
        var current_end_time;
        if(end_hour < hour)
        {
            current_end_time = d3.timeMinute.offset(d3.timeHour.offset(next_date, end_hour), end_minute);
        }
        else{
            current_end_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, end_hour), end_minute);
        }

        var bar_width = x_scale(current_end_time) - x_scale(current_start_time);

        return bar_width>=5?bar_width:5;
    })
    .attr('height', chart_option.suite.bar_height)
    //.style('stroke-width', '1px')
    //.style('stroke', 'black');
    .style('fill', function(d,i){
        if (! 'class' in d) {
            d.class = 'unknown';
        }
        return color_scale(d.class)
    });


//task_level_enter.append('text')
//    .attr('x', function(d, i){
//        var local_start_time = d.start_time;
//        var hour = parseInt(local_start_time.substr(0, 2));
//        var minute = parseInt(local_start_time.substr(3, 2));
//        var current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);
//
//        return x_scale(current_start_time) + 1;
//    })
//    .attr('y', function(d, i){
//        return 10;
//    })
//    .text(function(d, i){
//        return d.name;
//    })
//    .attr("dominant-baseline", "central")
//    .attr("text-anchor", "start");