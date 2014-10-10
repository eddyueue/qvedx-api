var wait = require('wait.for');
var sleep = require('sleep');
var apiSettings = require('./apiSettings')

//var QVEDX = require('qvedx-api')
var QVEDX = require('../../qvedx-api/index')
, q = new QVEDX(apiSettings);

var getServiceKey = function(){
    var result = wait.for(q.GetTimeLimitedServiceKey);
    return result; 
}

function triggerTask(){
    getServiceKey();
    var triggerResult = wait.for(q.TriggerEDXTask,{
        taskNameOrID: "QV11SystemMonitor",
        password: "test"
    });
    console.log("triggerResult",triggerResult);

    var status = 'Running';
    while(status == 'Running'){
        sleep.sleep(1);
        var taskStatus = wait.for(q.GetEDXTaskStatus,{
            executionID: triggerResult.ExecID
        });
        status = taskStatus.TaskStatus;
        console.log("Status: " + status);
    }

    console.dir(taskStatus);
}

wait.launchFiber(triggerTask);