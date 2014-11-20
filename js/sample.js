var sim = new Simulation();
sim.setProcessors(1);

var queue_names = [];

$(function() {
  $('#planButton').click(function() {
    planButton();
  });

  $('#setProcessorsButton').click(function() {
    var p = parseInt($('#processors').val());
    if(isNaN(p) || p <= 0) {
      $('#modalAlertLabel').html('Processors not added');
      $('#modalAlertBody').html('<p>There was a problem adding the processors to the current simulation.</p><p>Ensure that you entered a valid number.</p>');
    }
    else {
      sim.setProcessors(p);
      $('#modalAlertLabel').html('Processors added');
      $('#modalAlertBody').html('<p>The processors have been successfully set for the current simulation.</p>');
      $('#setProcessorsButton').removeClass("btn-warning");
      $('#setProcessorsButton').addClass("btn-success");
    }
    $('#modalAlert').modal();
  });

  $('#addQueueButton').click(function() {
    var n = $('#queue_name').val();
    var priority = parseInt($('#queue_priority').val());
    var policy = $('#queue_policy').val();
    var repeated = false;

    for(var i in queue_names) {
      if(queue_names[i] == n) repeated = true;
    }

    if(n.length <= 0 || isNaN(priority) || repeated) {
      $('#modalAlertLabel').html('Queue not added');
      $('#modalAlertBody').html('<p>There was a problem adding the queue to the current simulation.</p><p>Ensure that you entered a valid name and priority.</p>');
    }
    else {
      sim.addQueue(n, priority, policy);
      $('#modalAlertLabel').html('Queue added');
      $('#modalAlertBody').html('<p>The queue has been successfully added to the current simulation.</p>');
      if(queue_names.length == 0) {
        $('#addQueueButton').removeClass("btn-warning");
        $('#addQueueButton').addClass("btn-success");
      }
      queue_names.push(n);
    }
    $('#modalAlert').modal();
  });

});

function planButton() {
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

  while(r.finished == false) {
    sim.nextStep();
    r = sim.getStatus();
    console.log(r);
  }
}
