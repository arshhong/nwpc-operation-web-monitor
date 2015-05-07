/**
 * For work_system_real_time_monitor.html
 */
$(document).ready(function () {
    var socket = io.connect('http://127.0.0.1:5101/test');
    socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
    });
});
