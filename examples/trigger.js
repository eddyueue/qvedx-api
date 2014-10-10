var wait = require('wait.for');
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
    var triggerResult = wait.for(q.GetCALInfoForUser,{
        taskNameOrID: "QV11SystemMonitor",
        password: "test"
    });
    console.log("triggerResult",triggerResult);
}

wait.launchFiber(triggerTask);