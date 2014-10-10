var wait = require('wait.for');
var apiSettings = require('./apiSettings')

//var QVEDX = require('qvedx-api')
var QVEDX = require('../../qvedx-api/index')
, q = new QVEDX(apiSettings);

var getServiceKey = function(){
    var result = wait.for(q.GetTimeLimitedServiceKey);
    return result; 
}

function lookupNames(){
    getServiceKey();

    var services = wait.for(q.GetServices,{
        serviceTypes: q.SERVICE_TYPES.DSC
    });

    if(services && services.ServiceInfo){
        var users = wait.for(q.LookupNames,{
            user: "DOMAIN\\USER",
            dscID: services.ServiceInfo.ID
        });
        console.log("lookupNames",users);
    }
}

wait.launchFiber(lookupNames);