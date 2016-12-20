let class_styles = [
    {class_name:'unknown', color: '#bdbdbd'},
    {class_name:'serial',  color: '#4575b4'},
    {class_name:'serial_op',  color: '#74add1'},
    {class_name:'serial_op1', color: '#deebf7'},
    {class_name:'operation', color: '#cc4c02'},
    {class_name:'operation1',  color: '#f46d43'},
    {class_name:'operation2',  color: '#feb24c'},
    {class_name:'normal',  color: '#cb181d'},
    {class_name:'largemem', color: '#67000d'}
];

var my_timeline = new nwpc.timeline.TimeLine(document.getElementById("time-line-container"),{
    type: 'timeline',
    data: {
        class_styles: class_styles,
        data: data
    },
    options: {
        size: {
            'width': 1400
        }
    }
});

var my_timeline_legend = new nwpc.timeline.TimeLineLegend("#time-line-container-legend", {
    data: {
        class_styles: class_styles
    }
});