$(function() {
  $('#planButton').click(function() {
    planButton();
  });
});

function planButton() {
  var processors = $('#processors').val();

  var fcfs = new Policy('FCFS', fcfs_algorithm);
  var roundRobin = new Policy('RoundRobin', fcfs_algorithm);
  var srt = new Policy('SRT', srt_algorithm);

  var queue_1 = new Queue('Queue 1', 1, fcfs);
  var queue_2 = new Queue('Queue 2', 2, roundRobin);
  var queue_3 = new Queue('Queue 3', 3, roundRobin);
  var queue_4 = new Queue('Queue 4', 4, srt);

  var queues = [queue_1, queue_2, queue_3, queue_4];

  var process_a = new Process('A', queue_1, 5, 1, [0,1,0,0,1,1,1,0]);
  var process_b = new Process('B', queue_2, 4, 2, [0,0,1,1,1,0,1,1,1,0]);
  var process_c = new Process('C', queue_3, 2, 3, [0,0,0,0,1,1,1,1,0,0,1,1,0]);
  var process_d = new Process('D', queue_3, 3, 4, [0,1,1,1,1,0,0,0,1,1,1,1,0,0]);
  var process_e = new Process('E', queue_4, 6, 5, [0,0,1,1,0,0,0,0,1,0,0]);
  var process_f = new Process('F', queue_4, 1, 6, [0,0,0,0,1,0,0]);
  var processes = [process_a, process_b, process_c, process_d, process_e, process_f];

  //console.log(fcfs.name);
  //var x = fcfs.algorithm(processes);

  var system = new System(processors, processes, queues);
  system.plan();
}
