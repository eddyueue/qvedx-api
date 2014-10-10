var wait = require('wait.for');
var apiSettings = require('./apiSettings')

//var QVEDX = require('qvedx-api')
var QVEDX = require('../../qvedx-api/index')
, q = new QVEDX(apiSettings);

var getServiceKey = function(){
    var result = wait.for(q.GetTimeLimitedServiceKey);
    return result; 
}

function getCalInfo(){
    getServiceKey();

    var services = wait.for(q.GetServices,{
        serviceTypes: q.SERVICE_TYPES.QVS
    });

    if(services && services.ServiceInfo){
        var calInfo = wait.for(q.GetCALInfoForUser,{
            user: "DOMAIN\\USER",
            qvsID: services.ServiceInfo.ID
        });
        console.log("getCalInfo",calInfo);
    }
}

wait.launchFiber(getCalInfo);