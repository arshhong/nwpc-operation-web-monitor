var color_lib = d3.schemeCategory20c;


var color_domain = [
    'unknown',
    'serial', 'serial_op',
    'operation', 'operation1', 'operation2', 'normal', 'largemem'];

var color_range = [
        '#bdbdbd',
        '#4575b4', '#74add1',
        '#cc4c02', '#f46d43', '#8c6bb1', '#dd3497', '#fd8d3c'
    ];

var color_scale = d3.scaleOrdinal()
    .domain(color_domain)
    .range(color_range);