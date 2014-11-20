/**
* jsProScheSim.js
* Javascript (Simple) Process Scheduling Simulator

var sim = new Simulator();

sim.loadData(json);

sim.setProcessors(3);

sim.addQueue('hola', 1, 'FCFS');

sim.addProcess('A', 'hola', 1, 3, [0,1,0,0,1,1,1,0]);

var status = sim.getStatus();

var result = sim.nextStep();


Process status {
0 - Prepared
1 - Executing
2 - I/O
3 - Blocked
4 - Finished
}
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
  this.status = 0;
};

var Policy = function(name, algorithm) {
  this.name = name;
  this.algorithm = algorithm;
};

var Queue = function(name, priority, policy) {
  this.name = name;
  this.priority = priority;
  this.policy = policy;
  this.finished = false;
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

var System = function(processors, processes, queues) {
  this.processors = processors;
  this.processes = processes;
  this.queues = queues;
  /** Tasks can be interrupted before finishing all CPU cicles */
  this.isPreemptive = true;

  this.currentTime = 1;

  this.nextTime = function() {
    this.currentTime++;
  }

  this.plan = function() {
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
};

var Simulation = function() {
  this.processors = 1;
  this.processes = [];
  this.queues = [];
  this.policies = {};
  this.currentTime = 0;
  this.finished = false;

  this.policies['FCFS'] = fcfs_algorithm;
  this.policies['RoundRobin'] = fcfs_algorithm;
  this.policies['SRT'] = srt_algorithm;

  this.setProcessors = function(n) {
    this.processors = n;
  };

  this.addQueue = function(name, priority, policy) {
    var q = new Queue(name, priority, this.getPolicy(policy));
    this.queues.push(q);
  };

  this.addProcess = function(name, queue, arrivalTime, priority, execs) {
    var p = new Process(name, this.getQueue(queue), arrivalTime, priority, execs);
    this.processes.push(p);
  };

  this.getStatus = function() {
    return {
      'finished': this.finished,
      'currentTime': this.currentTime,
      'processes': this.processes,
      'queues': this.queues
    };
  };

  this.nextStep = function() {
    this.currentTime += 1;
    var currentTime = this.currentTime;
    var isSimFinished = true;
    for(var i in this.queues) {
      var queue = this.queues[i];
      console.log("Checking queue " + queue.name);
      if(queue.finished) continue;
      isSimFinished = false;
      var processesInQueue = this.processes.filter(function(p) {
        return p.queue.name == queue.name && p.arrivalTime <= currentTime && p.status != 4;
      });
      console.log("\tThere are " + processesInQueue.length + " processes in queue");
      queue.policy(processesInQueue);

      if(processesInQueue.length == 0) continue;

      var isCpuUsed = false;
      var isQueueFinished = true;
      for(p in processesInQueue) {
        console.log("\tChecking process " + processesInQueue[p].name);
        isAllFinished = false;
        if(processesInQueue[p].execs.length == 0) {
          processesInQueue[p].status = 4;
          continue;
        }
        if(processesInQueue[p].execs[0] == 1) {
          processesInQueue[p].execs.shift();
          processesInQueue[p].status = 2;
          console.log("Process " + processesInQueue[p].name + " goes I/O");
          continue;
        }
        if(!isCpuUsed) {
          console.log("Process " + processesInQueue[p].name + " goes CPU");
          processesInQueue[p].execs.shift();
          processesInQueue[p].status = 1;
          isCpuUsed = true;
        }
      }
      if(isQueueFinished) queue.finished = true;
    }
    if(isSimFinished) this.finished = true;
  };

  this.getQueue = function(name) {
    for(var i in this.queues) {
      if(this.queues[i].name == name) return this.queues[i];
    }
  }

  this.getPolicy = function(name) {
    return this.policies[name];
  };

  this.newPolicy = function(name, algorithm) {
    this.policies[name] = algorithm;
  };

};
