/**
 * For work_system_real_time_monitor.html
 */
$(document).ready(function () {
    var socket = io.connect('http://127.0.0.1:5101/hpc');
    socket.on('connect', function() {
        console.log('I\'m connected!');
    });
    socket.on('send_llq_info', function(msg){
        /*console.log(msg);*/
        var total = msg.in_queue;
        var waiting = msg.waiting;
        var held = msg.held;
        var running = msg.running;
        var pending = msg.pending;
        var preempted = msg.preempted;

        $('#total_llq_job_number').html(total);
        $('#waiting_llq_job_number').html(waiting);
        $('#held_llq_job_number').html(held);
        $('#running_llq_job_number').html(running);
        $('#pending_llq_job_number').html(pending);
        $('#preempted_llq_job_number').html(preempted);

    });
});
