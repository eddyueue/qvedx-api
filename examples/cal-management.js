var wait = require('wait.for');
var apiSettings = require('./apiSettings')

//var QVEDX = require('qvedx-api')
var QVEDX = require('../../qvedx-api/index')
, q = new QVEDX(apiSettings);

var getServiceKey = function(){
    var result = wait.for(q.GetTimeLimitedServiceKey);
    return result; 
}

function test(){
	getServiceKey();

    var services = wait.for(q.GetServices,{
        serviceTypes: 'QlikViewServer'
    });

    if(services && services.ServiceInfo){
        var documents = wait.for(q.GetUserDocuments,{
            qvsID: services.ServiceInfo.ID
        });

        if(documents && documents.DocumentNode){
            documents.DocumentNode.forEach(function(doc){
                //// THIS CODE IS RETURNING NO CAL DATA FOR TESTING SYSTEMS!
                var folderID = doc.FolderID
                var documentID = doc.ID;    
                var documentName = doc.Name;
                console.log('Doc: ' + folderID + ' ' + documentID + ' ' + documentName);

                var documentMetaData = wait.for(q.GetDocumentMetaData,{
                    documentNode: doc,
                    scope: 'All' // Licensing
                });
                console.dir(documentMetaData); 
                if(documentMetaData && documentMetaData.Licensing){
                    console.log("CALsAllocated: " + documentMetaData.Licensing.CALsAllocated);
                    console.log("AssignedCALs: ");
                    console.dir(documentMetaData.Licensing.AssignedCALs); 
                }          
            });
        }   
    }
}

wait.launchFiber(test);