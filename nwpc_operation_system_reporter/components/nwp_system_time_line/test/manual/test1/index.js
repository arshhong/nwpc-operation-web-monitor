console.log(nwpc);

var svg_size = {
    'width': 1400
};

nwpc.timeline.setSvgSize(svg_size);
nwpc.timeline.setSystemRunTimeData(data);
nwpc.timeline.setClassStyle([
    {class_name:'unknown', color: '#bdbdbd'},
    {class_name:'serial',  color: '#4575b4'},
    {class_name:'serial_op',  color: '#74add1'},
    {class_name:'serial_op1', color: '#deebf7'},
    {class_name:'operation', color: '#cc4c02'},
    {class_name:'operation1',  color: '#f46d43'},
    {class_name:'operation2',  color: '#feb24c'},
    {class_name:'normal',  color: '#cb181d'},
    {class_name:'largemem', color: '#67000d'}
]);
nwpc.timeline.drawLegend("#time-line-container-legend");
nwpc.timeline.drawTimeLineChart("#time-line-container");