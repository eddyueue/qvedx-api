qvedx-api
=====

Node Module for triggering EDX Tasks in QlikView (QMS API) (VERY BETA!)

# Pre Requisites
The QVEDX-API requires a CURL installation to communicate with the QlikView Management Service using NTLM authentication. (Tested with Version 7.37.0) Install CURL from [http://www.confusedbycode.com/curl/#downloads](http://www.confusedbycode.com/curl/#downloads) (add to path)
	




# Installation
    npm install pomalbisser/qvedx-api

## Example:
	var wait = require('wait.for');
	
	// Configuration
	var apiSettings = {
	    host: "MY.QMC.HOST",
	    ntlm: {user: 'DOMAIN\\USER:PASSWORD'}
	};
	
	var QVEDX = require('qvedx-api')
	//var QVEDX = require('../qvedx-api/index')
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
	}
	
	wait.launchFiber(triggerTask);

> Note: This module is in a very basic state and I can not guarantee full functionality.

### Dependencies Required by the Example
- npm install wait.for
- npm install node-uuid

### Example NPM Dependencies
  	"dependencies": {
    	"node-uuid": "^1.4.1",
    	"wait.for": "^0.6.6"
  	}    

# Documentation
See [doc/index.htm](https://github.com/pomalbisser/qvedx-api/blob/master/doc/markdown/readme.md)

# Working API Methods
- Trigger a QlikView QMS EDX Task - [TriggerEDXTask](https://github.com/pomalbisser/qvedx-api/doc/module-QVEDX.html#TriggerEDXTask)
- Get QlikView Services - [GetServices](https://github.com/pomalbisser/qvedx-api/doc/module-QVEDX.html#GetServices)
- Query User Documents - [GetUserDocuments](https://github.com/pomalbisser/qvedx-api/doc/module-QVEDX.html#GetUserDocuments)
- Query Document Meta Data - [GetDocumentMetaData](https://github.com/pomalbisser/qvedx-api/doc/module-QVEDX.html#GetDocumentMetaData)
- Get CAL Info for User - GetCALInfoForUser

Detailed API-Documentation: [doc/module-QVEDX.html](https://github.com/pomalbisser/qvedx-api/doc/module-QVEDX.html)


#Development
- Update Documentation
	> grunt generate-docs


#TODO
- Getting Started Tutorial