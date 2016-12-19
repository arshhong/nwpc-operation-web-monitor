var nwpc = (function(){
    return {}
})();


var nwpc = (function(mod){
    mod.timeline = (function(){
        var class_name = "nwpc-timeline";

        var system_run_time_data = null;

        var svg_size = {
            'width': 1800,
            'height': 1000
        };

        var chart_option = {
            'start_point': {
                'x': 250,
                'y': 30
            },
            "row": {
                'interval': 30,
                'bar_height': 20
            }
        };

        // color
        var color_domain = [
            'unknown',
            'serial', 'serial_op', 'serial_op1',
            'operation',
            'operation1', 'operation2', 'normal', 'largemem'
        ];

        var color_range = [
            '#bdbdbd',
            '#4575b4', '#74add1','#deebf7',
            '#cc4c02', '#f46d43', '#feb24c', '#cb181d', '#67000d'
        ];

        var color_scale = d3.scaleOrdinal()
            .domain(color_domain)
            .range(color_range);

        function setSvgSize(s){
            Object.keys(s).forEach(function(key){
                svg_size[key] = s[key];
            });
        }

        function setChartOption(copt){
            Object.keys(copt).forEach(function(key){
                chart_option[key] = copt[key];
            });
        }

        function setClassStyle(classes){
            color_domain = [];
            color_range = [];
            classes.forEach(function(a_class){
                color_domain.push(a_class.class_name);
                color_range.push(a_class.color);
            });
            color_scale = d3.scaleOrdinal()
                .domain(color_domain)
                .range(color_range);
        }

        function setSystemRunTimeData(data){
            system_run_time_data = data;
        }

        var legend_option = {
            data: {
                label: {
                    text: '队列名称'
                },
                info:{
                    text: '图中数字为并行队列使用的CPU核心数'
                }
            },
            options: {
                size: {
                    height: 50,
                    width: svg_size.width
                },
                start_point: {
                    x: chart_option.start_point.x
                }
            }
        };

        function drawLegend(node_id, user_option) {
            if(user_option.hasOwnProperty('options')){
                Object.keys(user_option.options).forEach(function(key) {
                    legend_option.options[key] = user_option.options[key];
                });
            }
            if(user_option.hasOwnProperty('data')){
                Object.keys(user_option.data).forEach(function(key) {
                    legend_option.data[key] = user_option.data[key];
                });
            }

            var legend_svg = d3.select(node_id)
                .append("svg")
                .classed(class_name, true)
                .attr('width', legend_option.options.size.width)
                .attr('height', legend_option.options.size.height);

            var legend_bar = legend_svg.append('g')
                .attr('transform', 'translate('+ legend_option.options.start_point.x +',0)');

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
                .text(legend_option.data.label.text);


            legend_bar.append('text')
                .attr('x', 0)
                .attr('y', 40)
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "start")
                .text(legend_option.data.info.text);
        }

        function drawTimeLineChart(container_node_id) {
            var svg = d3.select(container_node_id)
                .append("svg")
                .classed(class_name, true)
                .attr('width', svg_size.width)
                .attr('height', svg_size.height);

            // x scale: [0,24) hour
            var current_time = new Date();
            var start_hour = d3.timeDay(current_time);
            // console.log(start_hour);

            var next_date = d3.timeDay.offset(start_hour, 1);
            var end_hour = d3.timeHour.offset(next_date, 0);
            // console.log(end_hour);

            var x_scale = d3.scaleTime()
                .domain([start_hour, end_hour])
                .range([0, svg_size.width - 2*chart_option.start_point.x]);

            // x axis
            var x_axis = d3.axisTop(x_scale)
                .ticks(d3.timeHour.every(1))
                .tickFormat(d3.timeFormat("%H"))
                .tickSizeInner( -(system_run_time_data.length * chart_option.row.interval - chart_option.row.interval/2) );

            var axis_group = svg.append("g")
                .attr('transform', 'translate('+ chart_option.start_point.x +','+ chart_option.start_point.y + ')')
                .classed('axis', true)
                .call(x_axis);

            // y scale
            var y_scale = d3.scaleLinear()
                .domain([0, system_run_time_data.length-1])
                .range([chart_option.row.interval/2, (system_run_time_data.length-1)*chart_option.row.interval + chart_option.row.interval/2]);

            // y axis
            var y_axis = d3.axisLeft(y_scale)
                .ticks(system_run_time_data.length-1)
                .tickFormat("")
                .tickSizeInner( -(svg_size.width - 2*chart_option.start_point.x) );

            var y_axis_group = svg.append("g")
                .attr('transform', 'translate('+ chart_option.start_point.x +','+ chart_option.start_point.y + ')')
                .classed('axis', true)
                .call(y_axis);

            // time bar: row, one row per row
            var time_bar_group = svg.append("g")
                .attr('transform', 'translate('+ chart_option.start_point.x +','+ chart_option.start_point.y + ')');


            // row
            var row_data = time_bar_group.selectAll('.row')
                .data(system_run_time_data);

            var row_data_enter = row_data
                .enter()
                .append('g')
                .attr('transform', function(d, i){
                    return 'translate(0, '+ (chart_option.row.interval*i) +')'
                })
                .classed('row', true);

            // row label
            var row_label = row_data_enter
                .append('text')
                .attr('x', function(d,i){
                    return -10
                })
                .attr('y', function(d,i){
                    return chart_option.row.interval/2;
                })
                .text(function(d,i){
                    return d.label;
                })
                .attr('text-anchor', 'end')
                .attr("dominant-baseline", "central");

            // time item
            var time_item_data = row_data_enter
                .selectAll('.time-item-item')
                .data(function(d){ return d.times});

            var time_item_enter = time_item_data
                .enter()
                .append("g")
                .classed('time-item-item', true);

            // time level rect
            time_item_enter
                .append('rect')
                .attr('x', function(d, i){
                    var local_start_time = d.start_time;
                    var hour = parseInt(local_start_time.substr(0, 2));
                    var minute = parseInt(local_start_time.substr(3, 2));
                    var current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);

                    return x_scale(current_start_time);
                })
                .attr('y', function(d, i){
                    return (chart_option.row.interval - chart_option.row.bar_height)/2;
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
                .attr('height', chart_option.row.bar_height)
                .style('fill', function(d,i){
                    if (! 'class' in d) {
                        d.class = 'unknown';
                    }
                    return color_scale(d.class)
                });

            // time item label
            time_item_enter
                .filter(function(d,i){
                    return d.hasOwnProperty('label') && d.label != '';
                })
                .append('text')
                .attr('x', function(d, i){
                    var local_end_time = d.end_time;
                    var end_hour = local_end_time.substr(0, 2);
                    var end_minute = local_end_time.substr(3, 2);
                    var current_end_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, end_hour), end_minute);
                    return x_scale(current_end_time) + 2;
                })
                .attr('y', function(d, i){
                    return chart_option.row.interval/2;
                })
                .text(function(d, i){
                    return d.label;
                })
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "start");
        }

        return {
            setSvgSize: setSvgSize,
            setChartOption: setChartOption,
            setClassStyle: setClassStyle,
            setSystemRunTimeData: setSystemRunTimeData,
            drawLegend: drawLegend,
            drawTimeLineChart: drawTimeLineChart
        }
    })();
    return mod;
})(nwpc);
