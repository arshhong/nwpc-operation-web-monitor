var color_lib = d3.schemeCategory20c;


var color_domain = [
    'unknown',
    'serial', 'serial_op', 'operation',
    'operation1', 'operation2', 'normal', 'largemem'
];


var color_range = [
        '#bdbdbd',
        '#4575b4', '#74add1',
        '#cc4c02', '#f46d43', '#feb24c', '#cb181d', '#67000d'
    ];

var color_scale = d3.scaleOrdinal()
    .domain(color_domain)
    .range(color_range);