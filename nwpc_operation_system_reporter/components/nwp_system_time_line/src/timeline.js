var nwpc = (function(){
    return {}
})();


var nwpc = (function(mod){
    mod.timeline = (function(){
        let class_name = "nwpc-timeline";

        /**
         *
         * @param context HTML标签id
         * @param config 选项
         *      {
         *          type: 'timeline',
         *          data: {
         *              class_styles: [
         *              ],
         *              data:[
         *                  {class_name:'unknown', color: '#bdbdbd'},
         *                  {class_name:'serial',  color: '#4575b4'},
         *              ]
         *          },
         *          options: {
         *              size: {
         *                  width: 1800,
         *                  height: 1000
         *              },
         *              start_point: {
         *                  x: 250,
         *                  y: 30
         *              },
         *              row: {
         *                  interval: 30,
         *                  bar_height: 20
         *              }
         *          }
         *      }
         * @constructor
         */
        function TimeLine(context, config){
            this.context = context;
            this.config = {};
            this.color_scale = null;
            this.color_domain = [];
            this.color_range = [];

            // merge config
            Object.assign(this.config, TimeLine.default);

            if(config.hasOwnProperty('options')) {
                let options = this.config.options;
                let user_options = config.options;

                if(user_options.hasOwnProperty("size")) {
                    Object.keys(user_options.size).forEach(function (key) {
                        options.size[key] = user_options.size[key];
                    });
                }

                if(user_options.hasOwnProperty("start_point")) {
                    Object.keys(user_options.start_point).forEach(function (key) {
                        options.start_point[key] = user_options.start_point[key];
                    });
                }

                if(user_options.hasOwnProperty("row")) {
                    Object.keys(user_options.row).forEach(function (key) {
                        options.row[key] = user_options.row[key];
                    });
                }
            }

            if(config.hasOwnProperty("data")) {
                let data = this.config.data;
                let user_data = config.data;

                if(user_data.hasOwnProperty("class_styles")) {
                    data.class_styles = user_data.class_styles;

                    let color_domain = this.color_domain;
                    let color_range = this.color_range;
                    data.class_styles.forEach(function(a_class){
                        color_domain.push(a_class.class_name);
                        color_range.push(a_class.color);
                    });
                    this.color_scale = d3.scaleOrdinal()
                        .domain(color_domain)
                        .range(color_range);
                }

                if(user_data.hasOwnProperty("data")) {
                    data.data = user_data.data;
                }
            }

            // generate necessary objects
            this.drawTimeLineChart(this.context, this.config);
        }

        TimeLine.prototype = {
            constructor: TimeLine,
            version: function(){
                console.log("TimeLine V0.1.0");
                console.log(this.config);
            },
            drawTimeLineChart: function(context, config) {
                let options = config.options;
                let data = config.data;
                let color_scale = this.color_scale;

                let svg = d3.select(context)
                    .append("svg")
                    .classed(class_name, true)
                    .attr('width', options.size.width)
                    .attr('height', options.size.height);

                // x scale: [0,24) hour
                let current_time = new Date();
                let start_hour = d3.timeDay(current_time);

                let next_date = d3.timeDay.offset(start_hour, 1);
                let end_hour = d3.timeHour.offset(next_date, 0);

                let x_scale = d3.scaleTime()
                    .domain([start_hour, end_hour])
                    .range([0, options.size.width - 2*options.start_point.x]);

                // x axis
                let x_axis = d3.axisTop(x_scale)
                    .ticks(d3.timeHour.every(1))
                    .tickFormat(d3.timeFormat("%H"))
                    .tickSizeInner( -(data.data.length * options.row.interval - options.row.interval/2) );

                let axis_group = svg.append("g")
                    .attr('transform', 'translate('+ options.start_point.x +','+ options.start_point.y + ')')
                    .classed('axis', true)
                    .call(x_axis);

                // y scale
                let y_scale = d3.scaleLinear()
                    .domain([0, data.data.length-1])
                    .range([options.row.interval/2, (data.data.length-1)*options.row.interval + options.row.interval/2]);

                // y axis
                let y_axis = d3.axisLeft(y_scale)
                    .ticks(data.data.length-1)
                    .tickFormat("")
                    .tickSizeInner( -(options.size.width - 2*options.start_point.x) );

                let y_axis_group = svg.append("g")
                    .attr('transform', 'translate('+ options.start_point.x +','+ options.start_point.y + ')')
                    .classed('axis', true)
                    .call(y_axis);

                // time bar: row, one row per row
                let time_bar_group = svg.append("g")
                    .attr('transform', 'translate('+ options.start_point.x +','+ options.start_point.y + ')');


                // row
                let row_data = time_bar_group.selectAll('.row')
                    .data(data.data);

                let row_data_enter = row_data
                    .enter()
                    .append('g')
                    .attr('transform', function(d, i){
                        return 'translate(0, '+ (options.row.interval*i) +')'
                    })
                    .classed('row', true);

                // row label
                let row_label = row_data_enter
                    .append('text')
                    .attr('x', function(d,i){
                        return -10
                    })
                    .attr('y', function(d,i){
                        return options.row.interval/2;
                    })
                    .text(function(d,i){
                        return d.label;
                    })
                    .attr('text-anchor', 'end')
                    .attr("dominant-baseline", "central");

                // time item
                let time_item_data = row_data_enter
                    .selectAll('.time-item-item')
                    .data(function(d){ return d.times});

                let time_item_enter = time_item_data
                    .enter()
                    .append("g")
                    .classed('time-item-item', true);

                // time level rect
                time_item_enter
                    .append('rect')
                    .attr('x', function(d, i){
                        let local_start_time = d.start_time;
                        let hour = parseInt(local_start_time.substr(0, 2));
                        let minute = parseInt(local_start_time.substr(3, 2));
                        let current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);

                        return x_scale(current_start_time);
                    })
                    .attr('y', function(d, i){
                        return (options.row.interval - options.row.bar_height)/2;
                    })
                    .attr('width', function(d,i){
                        let local_start_time = d.start_time;
                        let hour = parseInt(local_start_time.substr(0, 2));
                        let minute = parseInt(local_start_time.substr(3, 2));
                        let current_start_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, hour), minute);

                        let local_end_time = d.end_time;
                        let end_hour = local_end_time.substr(0, 2);
                        let end_minute = local_end_time.substr(3, 2);
                        let current_end_time;
                        if(end_hour < hour)
                        {
                            current_end_time = d3.timeMinute.offset(d3.timeHour.offset(next_date, end_hour), end_minute);
                        }
                        else{
                            current_end_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, end_hour), end_minute);
                        }

                        let bar_width = x_scale(current_end_time) - x_scale(current_start_time);

                        return bar_width>=5?bar_width:5;
                    })
                    .attr('height', options.row.bar_height)
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
                        let local_end_time = d.end_time;
                        let end_hour = local_end_time.substr(0, 2);
                        let end_minute = local_end_time.substr(3, 2);
                        let current_end_time = d3.timeMinute.offset(d3.timeHour.offset(start_hour, end_hour), end_minute);
                        return x_scale(current_end_time) + 2;
                    })
                    .attr('y', function(d, i){
                        return options.row.interval/2;
                    })
                    .text(function(d, i){
                        return d.label;
                    })
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "start");
            }
        };

        TimeLine.default = {
            type: 'timeline',
            data: {
                class_styles: [
                    {class_name:'unknown', color: '#bdbdbd'},
                    {class_name:'serial',  color: '#4575b4'},
                    {class_name:'serial_op',  color: '#74add1'},
                    {class_name:'serial_op1', color: '#deebf7'},
                    {class_name:'operation', color: '#cc4c02'},
                    {class_name:'operation1',  color: '#f46d43'},
                    {class_name:'operation2',  color: '#feb24c'},
                    {class_name:'normal',  color: '#cb181d'},
                    {class_name:'largemem', color: '#67000d'}
                ]
            },
            options: {
                size: {
                    width: 1800,
                    height: 1000
                },
                start_point: {
                    x: 250,
                    y: 30
                },
                row: {
                    interval: 30,
                    bar_height: 20
                }
            }
        };

        function TimeLineLegend(context, config){
            this.context = context;
            this.config = {};

            this.color_scale = null;
            this.color_domain = [];
            this.color_range = [];

            // merge config
            Object.assign(this.config, TimeLineLegend.default);


            if(config.hasOwnProperty('options')){
                let options = this.config.options;
                let user_options = config.options;

                if(user_options.hasOwnProperty("size")) {
                    Object.keys(user_options.size).forEach(function (key) {
                        options.size[key] = user_options.size[key];
                    });
                }

                if(user_options.hasOwnProperty("start_point")) {
                    Object.keys(user_options.start_point).forEach(function (key) {
                        options.start_point[key] = user_options.start_point[key];
                    });
                }
            }

            if(config.hasOwnProperty('data')){
                let data = this.config.data;
                let user_data = config.data;

                if(user_data.hasOwnProperty("class_styles")) {
                    data.class_styles = user_data.class_styles;

                    let color_domain = this.color_domain;
                    let color_range = this.color_range;
                    data.class_styles.forEach(function(a_class){
                        color_domain.push(a_class.class_name);
                        color_range.push(a_class.color);
                    });
                    this.color_scale = d3.scaleOrdinal()
                        .domain(color_domain)
                        .range(color_range);
                }

                if(user_data.hasOwnProperty("label")) {
                    Object.keys(user_data.label).forEach(function (key) {
                        data.label[key] = user_data.label[key];
                    });
                }

                if(user_data.hasOwnProperty("info")) {
                    Object.keys(user_data.info).forEach(function (key) {
                        data.info[key] = user_data.info[key];
                    });
                }
            }

            this.drawLegend();
        }

        TimeLineLegend.prototype = {
            constructor: TimeLineLegend,
            drawLegend: function() {
                let context = this.context;
                let data = this.config.data;
                let options = this.config.options;

                let color_domain = this.color_domain;
                let color_scale = this.color_scale;

                let legend_svg = d3.select(context)
                    .append("svg")
                    .classed(class_name, true)
                    .attr('width', options.size.width)
                    .attr('height', options.size.height);

                let legend_bar = legend_svg.append('g')
                    .attr('transform', 'translate('+ options.start_point.x +',0)');

                let legend_enter = legend_bar.selectAll('.legend-item')
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

                let legend_bar_label = legend_bar.append('text')
                    .attr('x', -15)
                    .attr('y', 15)
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "end")
                    .text(data.label.text);


                legend_bar.append('text')
                    .attr('x', 0)
                    .attr('y', 40)
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "start")
                    .text(data.info.text);
            }

        };

        TimeLineLegend.default = {
            data: {
                label: {
                    text: '队列名称'
                },
                info:{
                    text: '图中数字为并行队列使用的CPU核心数'
                },
                class_styles: []
            },
            options: {
                size: {
                    height: 50,
                    width: TimeLine.default.options.size.width
                },
                start_point: {
                    x: TimeLine.default.options.start_point.x
                }
            }
        };

        return {
            TimeLine: TimeLine,
            TimeLineLegend: TimeLineLegend
        }
    })();
    return mod;
})(nwpc);
