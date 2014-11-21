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
-1 - Not arrived yet
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
  this.status = -1;
};

var Policy = function(name, algorithm) {
  this.name = name;
  this.algorithm = algorithm;
};

var Queue = function(name, priority, policy, quantum) {
  this.name = name;
  this.priority = priority;
  this.policy = policy;
  this.finished = false;
  this.quantum = typeof quantum !== 'undefined' ? quantum : 1;
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

var roundRobin_algorithm = function(processes) {
  if(processes.length > 0) {
    processes.push(processes[0]);
    processes.shift();
  }
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

var Simulation = function() {
  this.processors = 1;
  this.processes = [];
  this.isPreemptive = true;
  this.queues = [];
  this.policies = {};
  this.currentTime = 0;
  this.finished = false;

  this.policies['FCFS'] = fcfs_algorithm;
  this.policies['RoundRobin'] = roundRobin_algorithm;
  this.policies['SRT'] = srt_algorithm;

  this.setProcessors = function(n) {
    this.processors = n;
  };

  this.addQueue = function(name, priority, policy) {
    var q = new Queue(name, priority, this.getPolicy(policy));
    this.queues.push(q);
  };

  this.addQueue = function(name, priority, policy, quantum) {
    var q = new Queue(name, priority, this.getPolicy(policy), quantum);
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
    var usedCPU = 0;

    for(var i in this.queues) {
      var queue = this.queues[i];
      var isQueueFinished = true;
      //console.log("Checking queue " + queue.name);
      if(queue.finished) continue;

      var allProcessesInQueue = this.processes.filter(function(p) {
        return p.queue.name == queue.name && p.status != 4;
      });
      if(allProcessesInQueue.length > 0) {
        isQueueFinished = false;
        isSimFinished = false;
        isAllFinished = false;
      }

      var processesInQueue = this.processes.filter(function(p) {
        return p.queue.name == queue.name && p.arrivalTime <= currentTime && p.status != 4;
      });
      //console.log("\tThere are " + processesInQueue.length + " processes in queue");
      queue.policy(processesInQueue);

      if(processesInQueue.length == 0) continue;

      for(p in processesInQueue) {
        //console.log("\tChecking process " + processesInQueue[p].name);
        if(processesInQueue[p].execs.length == 0) {
          processesInQueue[p].status = 4;
          continue;
        }

        if(processesInQueue[p].status != 4) {
          isQueueFinished = false;
          isSimFinished = false;
          isAllFinished = false;
        }

        if(processesInQueue[p].execs[0] == 1) {
          processesInQueue[p].execs.shift();
          processesInQueue[p].status = 2;
          console.log("Process " + processesInQueue[p].name + " goes I/O");
          continue;
        }
        if(usedCPU < this.processors) {
          console.log("Process " + processesInQueue[p].name + " goes CPU");
          processesInQueue[p].execs.shift();
          processesInQueue[p].status = 1;
          usedCPU += 1;
        }
        else if(processesInQueue[p].status == 1 || processesInQueue[p].status == 3) {
          console.log("Process " + processesInQueue[p].name + " goes Blocked");
          processesInQueue[p].status = 3;
        }
        else {
          console.log("Process " + processesInQueue[p].name + " goes Prepared");
          processesInQueue[p].status = 0;
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
