var sim = new Simulation();
var queue_names = [];
var process_names = [];

function isReady() {
  var pBar = 0;
  if(sim.processors > 0) pBar += 30;
  if(queue_names.length > 0) pBar += 30;
  if(process_names.length > 0) pBar += 30;

  $('#progressBar').width(pBar + '%');

  if(sim.processors > 0 && queue_names.length > 0 && process_names.length > 0) {
    $('#readySimButton').removeClass("disabled");
    return true;
  }
  return false;
}

$(function() {
  sim = new Simulation();
  sim.setProcessors(1);
  sim.addQueue('Queue 1', 1, 'FCFS');
  sim.addQueue('Queue 2', 2, 'RoundRobin', 1);
  sim.addQueue('Queue 3', 3, 'RoundRobin', 3);
  sim.addQueue('Queue 4', 4, 'SRT');

  sim.addProcess('A', 'Queue 1', 5, 1, [0,1,0,0,1,1,1,0]);
  sim.addProcess('B', 'Queue 2', 4, 2, [0,0,1,1,1,0,1,1,1,0]);
  sim.addProcess('C', 'Queue 3', 2, 3, [0,0,0,0,1,1,1,1,0,0,1,1,0]);
  sim.addProcess('D', 'Queue 3', 3, 4, [0,1,1,1,1,0,0,0,1,1,1,1,0,0]);
  sim.addProcess('E', 'Queue 4', 6, 5, [0,0,1,1,0,0,0,0,1,0,0]);
  sim.addProcess('F', 'Queue 4', 1, 6, [0,0,0,0,1,0,0]);

  $('#queue_policy').change(function() {
    console.log("wa");
    $('#queue_policy option:selected').each(function() {
      console.log($(this).text());
      if($(this).text() == "RoundRobin") {
        console.log("remove!");
        $('#queue_quantum_group').removeClass("hidden");
      }
      else {
        $('#queue_quantum_group').addClass("hidden");
      }
    });
  });

  $('#nextStepButton').click(function() {
    nextStep();
  });

  $('#readySimButton').click(function() {
    $('#nextStepButton').removeClass("disabled");
    $('#result').html('');
    var phtml = '';
    for(var i in process_names) {
      phtml += '<tr id="trp' + process_names[i] + '"><td><b>' + process_names[i] + '</b></td></tr>';
    }
    $('#result').append('<table id="resultTable" class="table table-striped table-hover table-condensed table-bordered"><thead><tr id="rtHead"><th>Process</th></tr></thead><tbody>' + phtml + '</tbody></table>');
    $('#progressBar').width('100%');
    $('#progressBar').addClass("progress-bar-success");
    $('#readySimButton').addClass("disabled");
    $('#modalAlertLabel').html('Simulation is ready');
    $('#modalAlertBody').html('<p>Simulation successfully configured and ready.</p><p>Enjoy :-)</p>');
    $('#modalAlertContent').removeClass("alert-danger");
    $('#modalAlertContent').addClass("alert-info");
    $('#modalAlert').modal();
  });

  $('#setProcessorsButton').click(function() {
    var p = parseInt($('#processors').val());
    if(isNaN(p) || p <= 0) {
      $('#modalAlertLabel').html('Processors not added');
      $('#modalAlertBody').html('<p>There was a problem adding the processors to the current simulation.</p><p>Ensure that you entered a valid number.</p>');
      $('#modalAlertContent').addClass("alert-danger");
      $('#modalAlertContent').removeClass("alert-success");
    }
    else {
      sim.setProcessors(p);
      $('#modalAlertLabel').html('Processors added');
      $('#modalAlertBody').html('<p>The processors have been successfully set for the current simulation.</p>');
      $('#modalAlertContent').removeClass("alert-danger");
      $('#modalAlertContent').addClass("alert-success");
      $('#setProcessorsButton').removeClass("btn-warning");
      $('#setProcessorsButton').addClass("btn-success");
      $('#summary_processors').html(p);
      isReady();
    }
    $('#modalAlert').modal();
  });

  $('#addQueueButton').click(function() {
    var n = $('#queue_name').val();
    var priority = parseInt($('#queue_priority').val());
    var policy = $('#queue_policy').val();
    var quantum = $('#queue_quantum').val();
    var repeated = false;

    for(var i in queue_names) {
      if(queue_names[i] == n) repeated = true;
    }

    if(n.length <= 0 || isNaN(priority) || repeated || (policy == "RoundRobin" && isNaN(quantum))) {
      $('#modalAlertLabel').html('Queue not added');
      $('#modalAlertBody').html('<p>There was a problem adding the queue to the current simulation.</p><p>Ensure that you entered a valid name and priority.</p>');
      $('#modalAlertContent').addClass("alert-danger");
      $('#modalAlertContent').removeClass("alert-success");
    }
    else {
      if(policy == "RoundRobin") {
        sim.addQueue(n, priority, policy, quantum);
      }
      else {
        sim.addQueue(n, priority, policy);
      }

      $('#modalAlertLabel').html('Queue added');
      $('#modalAlertBody').html('<p>The queue has been successfully added to the current simulation.</p>');
      $('#modalAlertContent').removeClass("alert-danger");
      $('#modalAlertContent').addClass("alert-success");
      if(queue_names.length == 0) {
        $('#addQueueButton').removeClass("btn-warning");
        $('#addQueueButton').addClass("btn-success");
      }
      queue_names.push(n);
      $('#process_queue').append(new Option(n, n));
      $('#summary_queues').append('<li class="list-group-item" style="padding-left:5em;"><samp>Queue: <span class="badge">' + n + ' (priority = ' + priority + ', policy = ' + policy + ')</span></samp></li>');
      $('#summary_queues_number').html(queue_names.length);
      isReady();
    }
    $('#modalAlert').modal();
  });

  $('#addProcessButton').click(function() {
    var n = $('#process_name').val();
    var q = $('#process_queue').val();
    var arrivalTime = parseInt($('#process_arrivalTime').val());
    var priority = parseInt($('#process_priority').val());
    var pbursts = $('#process_exec').val();
    var bursts = [];
    var repeated = false;

    for(var i in process_names) {
      if(process_names[i] == n) repeated = true;
    }
    for(var i in pbursts) {
      var b = parseInt(pbursts[i]);
      if(isNaN(b)) repeated = true;
      bursts.push(b);
    }

    if(n.length <= 0 || bursts.length <= 0 || isNaN(priority) || isNaN(arrivalTime) || repeated) {
      $('#modalAlertLabel').html('Process not added');
      $('#modalAlertBody').html('<p>There was a problem adding the process to the current simulation.</p><p>Ensure that you entered valid parameters.</p>');
      $('#modalAlertContent').addClass("alert-danger");
      $('#modalAlertContent').removeClass("alert-success");
    }
    else {
      sim.addProcess(n, q, arrivalTime, priority, bursts);
      $('#modalAlertLabel').html('Process added');
      $('#modalAlertBody').html('<p>The process has been successfully added to the current simulation.</p>');
      $('#modalAlertContent').removeClass("alert-danger");
      $('#modalAlertContent').addClass("alert-success");
      if(queue_names.length == 0) {
        $('#addProcessButton').removeClass("btn-warning");
        $('#addProcessButton').addClass("btn-success");
      }
      process_names.push(n);
      $('#summary_processes').append('<li class="list-group-item" style="padding-left:5em;"><samp>Process: <span class="badge">' + n + ' (queue = ' + q + ', arrival time = ' + arrivalTime + ', priority = ' + priority + ', bursts = [' + pbursts + '])</span></samp></li>');
      $('#summary_process_number').html(process_names.length);
      isReady();
    }
    $('#modalAlert').modal();
  });

});

function nextStep() {
  var r = sim.getStatus();
  if(r.finished == false) {
    sim.nextStep();
    r = sim.getStatus();
    $('#rtHead').append('<th>' + r.currentTime + '</th>');
    for(var i in r.processes) {
      $('#trp' + r.processes[i].name).append('<td>' + convertStatus(r.processes[i].status) + '</td>');
    }
    console.log(r);
  }
}

function convertStatus(s) {
  if(s == -1) return '';
  else if(s == 0) return 'P';
  else if(s == 1) return 'E';
  else if(s == 2) return 'W';
  else if(s == 3) return 'B';
  else return 'F';
}
