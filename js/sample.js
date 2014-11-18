$(function() {
  $('#planButton').click(function() {
    planButton();
  });
});

function planButton() {
  var processors = $('#processors').val();

  var sim = new Simulation();

  sim.setProcessors(3);
  sim.addQueue('Queue 1', 1, 'FCFS');
  sim.addQueue('Queue 2', 2, 'RoundRobin');
  sim.addQueue('Queue 3', 3, 'RoundRobin');
  sim.addQueue('Queue 4', 4, 'SRT');

  sim.addProcess('A', 'Queue 1', 5, 1, [0,1,0,0,1,1,1,0]);
  sim.addProcess('B', 'Queue 2', 4, 2, [0,0,1,1,1,0,1,1,1,0]);
  sim.addProcess('C', 'Queue 3', 2, 3, [0,0,0,0,1,1,1,1,0,0,1,1,0]);
  sim.addProcess('D', 'Queue 3', 3, 4, [0,1,1,1,1,0,0,0,1,1,1,1,0,0]);
  sim.addProcess('E', 'Queue 4', 6, 5, [0,0,1,1,0,0,0,0,1,0,0]);
  sim.addProcess('F', 'Queue 4', 1, 6, [0,0,0,0,1,0,0]);

  var r = sim.getStatus();

  while(r.finished == false && r.currentTime < 100) {
    sim.nextStep();
    r = sim.getStatus();
    console.log(r);
  }
}
