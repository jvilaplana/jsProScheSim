/**
* jsProScheSim.js
* Javascript (Simple) Process Scheduling Simulator
*/

$.arrayIntersect = function(a, b) {
  return $.grep(a, function(i) {
    return $.inArray(i, b) > -1;
  });
};

var Process = function(name, queue, arrivalTime, priority, execs) {
  this.name = name;
  this.queue = queue;
  this.arrivalTime = arrivalTime;
  this.priority = priority;
  this.execs = execs;
};

var Policy = function(name, algorithm) {
  this.name = name;
  this.algorithm = algorithm;
};

var Queue = function(name, priority, policy) {
  this.name = name;
  this.priority = priority;
  this.policy = policy;
};

var System = function(processors, processes, queues) {
  this.processors = processors;
  this.processes = processes;
  this.queues = queues;

  this.currentTime = 1;
};

System.prototype.nextTime = function() {
  this.currentTime++;
}

System.prototype.plan = function() {
  var inputProcesses = this.processes.slice(0);
  var currentProcesses = [];
  var currentTime = this.currentTime;
  var queues = this.queues;
  var isCpuUsed = false;
  var finishedProcesses = 0;
  var result = new Array();

  currentProcesses = this.processes.filter(function(p) {
    return p.arrivalTime <= currentTime;
  });

  while(this.processes.length > 0) {
    console.log("CYCLE " + currentTime);
    var resultRound = new Array();
    for(p in this.processes) {
      if(currentTime > 1) {
        //console.log(result[currentTime-2]["F"]);
      }
      if(currentTime > 1 && (result[currentTime-2][this.processes[p].name] == "E" || result[currentTime-2][this.processes[p].name] == "B")) {
        resultRound[this.processes[p].name] = "B";
      }
      else resultRound[this.processes[p].name] = "";
    }

    currentProcesses = this.processes.filter(function(p) {
      return p.arrivalTime <= currentTime;
    });

    for(q in this.queues) {
      var processesInQueue = currentProcesses.filter(function(p) {
        return p.queue.name == queues[q].name;
      });

      this.queues[q].policy.algorithm(processesInQueue);

      if(processesInQueue.length == 0) continue;

      var finished_p = [];
      for(p in processesInQueue) {
        if(processesInQueue[p].execs[0] == 1) {
          processesInQueue[p].execs.shift();
          console.log("Process " + processesInQueue[p].name + " goes I/O");
          resultRound[processesInQueue[p].name] = "W";
          if(processesInQueue[p].execs.length == 0) {
            console.log("Process " + processesInQueue[p].name + " is over");
            //this.processes.splice(this.processes.indexOf(processesInQueue[p]), 1);
            //processesInQueue.splice(p, 1);
            finished_p.push(processesInQueue[p]);
            finishedProcesses++;
          }
          continue;
        }
        if(!isCpuUsed) {
          console.log("Process " + processesInQueue[p].name + " goes CPU");
          resultRound[processesInQueue[p].name] = "E";
          processesInQueue[p].execs.shift();
          if(processesInQueue[p].execs.length == 0) {
            console.log("Process " + processesInQueue[p].name + " is over");
            //this.processes.splice(this.processes.indexOf(processesInQueue[p]), 1);
            //processesInQueue.splice(p, 1);
            finished_p.push(processesInQueue[p]);
            finishedProcesses++;
          }
          isCpuUsed = true;
        }
      }
      for(f in finished_p) {
        this.processes.splice(this.processes.indexOf(finished_p[f]), 1);
      }


    }
    currentTime++;
    result.push(resultRound);
    isCpuUsed = false;
  }
  console.log(result);
  var resultDiv = $('#result');
  resultDiv.append('<table id="resultTable"><thead><tr id="resultTableHead"></tr></thead><tbody id="resultTableBody"></tbody></table>');

  $('#resultTableHead').append('<th></th>');
  for(var i = 0; i < result.length; i++) {
    $('#resultTableHead').append('<th>' + i + '</th>');
  }

  for(p in inputProcesses) {
    var html = '';
    html += '<tr><td>' + inputProcesses[p].name + '</td>';
    for(r in result) {
      html += '<td>' + (result[r][inputProcesses[p].name] || '') + '</td>'
    }
    html += '</tr>';
    $('#resultTableBody').append(html);
  }
};

var fcfs_algorithm = function(processes) {
  processes.sort(function(a, b) {
    if(a.arrivalTime < b.arrivalTime) {
      return -1;
    }
    if(a.arrivalTime > b.arrivalTime) {
      return 1;
    }
    if(a.arrivalTime == b.arrivalTime) {
      if(a.priority < b.priority) {
        return -1;
      }
      if(a.priority > b.priority) {
        return 1;
      }
    }
    return 0;
  });
};

var srt_algorithm = function(processes) {
  processes.sort(function(a, b) {
    if(a.execs.length < b.execs.length) {
      return -1;
    }
    if(a.execs.length > b.execs.length) {
      return 1;
    }
    if(a.execs.length == b.execs.length) {
      if(a.priority < b.priority) {
        return -1;
      }
      if(a.priority > b.priority) {
        return 1;
      }
    }
    return 0;
  });
};
