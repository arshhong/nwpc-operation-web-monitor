/**
 * For work_system_monitor.html
 */
$(document).ready(function () {
    var quota_chart_func=function(node_id,title,percent){
        $(node_id).highcharts({
            chart: {
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false
            },

            title: {
                text: title
            },

            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#FFF'],
                            [1, '#333']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }, {
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#333'],
                            [1, '#FFF']
                        ]
                    },
                    borderWidth: 1,
                    outerRadius: '107%'
                }, {
                    // default background
                }, {
                    backgroundColor: '#DDD',
                    borderWidth: 0,
                    outerRadius: '105%',
                    innerRadius: '103%'
                }]
            },

            // the value axis
            yAxis: {
                min: 0,
                max: 100,

                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',

                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: '%'
                },
                plotBands: [{
                    from: 0,
                    to: 60,
                    color: '#55BF3B' // green
                }, {
                    from: 60,
                    to: 80,
                    color: '#DDDF0D' // yellow
                }, {
                    from: 80,
                    to: 100,
                    color: '#DF5353' // red
                }]
            },

            series: [{
                name: title,
                data: [percent],
                tooltip: {
                    valueSuffix: '%'
                }
            }]

	    });
    };

    $.get("/api/system/quota",function(data,status){
        var quota_list = jQuery.parseJSON(data);

        var aaData = [];

        for(var i=0;i<quota_list['file_systems'].length;i++)
        {
            var node_id = "gauge-"+ i.toString();
            var each_file_system = quota_list['file_systems'][i];
            var title = each_file_system['file_system'];
            var current_soft_percent = each_file_system['current_usage']/
                each_file_system['soft_limit']*100;
            current_soft_percent = Number(current_soft_percent.toFixed(2));

            var current_hard_percent = each_file_system['current_usage']/
                each_file_system['hard_limit']*100;
            current_hard_percent = Number(current_hard_percent.toFixed(2));

            $('#gauge-container').append('<div class="col-md-4"><div id="'+node_id+'"></div></div>');
            quota_chart_func("#"+node_id,title,current_soft_percent);


            aaData.push([each_file_system['file_system'],
                         each_file_system['quota_type'],
                         current_soft_percent.toString()+"%",
                         current_hard_percent.toString()+"%"
            ]);
        }

        $('#quota-table-container').html('<table class="table quota-table" id="quota-table-no-1"></table>');
        $('#quota-table-no-1').dataTable({
            "aaData": aaData,
            "aoColumns": [
                { "sTitle": "文件系统" },
                { "sTitle": "类型" },
                { "sTitle": "软限制百分比", "sClass": "center" },
                { "sTitle": "硬限制百分比", "sClass": "center" },
            ],
            "bFilter": false,
            "bInfo": false,
            "bLengthChange": false,
            "bPaginate": false
	    });
    });

});
