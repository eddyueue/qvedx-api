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
	var apiSettings: {
		host: "<QMS-HOST>",
	    ntlm: {user: '<DOMAIN>\\<USER>:<PASSWORD>'}
	};

    var QVEDX = require('qvedx-api')
    , q = new QVEDX(apiSettings);

	var getServiceKey = function(){
	    var result = wait.for(q.GetTimeLimitedServiceKey);
	    return result; 
	}

	function triggerTask(){
		getServiceKey();
		console.log("Starting EDX Task: " + url.query.taskname);
		var triggerResult = wait.for(q.TriggerEDXTask,{
		    taskNameOrID: "My EX Task",
		    password: "foo"
		});
		console.log("triggerResult",triggerResult);
	}

	wait.launchFiber(triggerTask);

> Note: This module is in a very basic state and I can not guarantee full functionality.

# Documentation
See [doc/index.htm](./doc/index.html)

# Working API Methods
- Trigger a QlikView QMS EDX Task - [TriggerEDXTask](doc/module-QVEDX.html#TriggerEDXTask)
- Get QlikView Services - [GetServices](doc/module-QVEDX.html#GetServices)
- Query User Documents - [GetUserDocuments](doc/module-QVEDX.html#GetUserDocuments)
- Query Document Meta Data - [GetDocumentMetaData](doc/module-QVEDX.html#GetDocumentMetaData)

Detailed API-Documentation: [doc/module-QVEDX.html](doc/module-QVEDX.html)


#Development
- Update Documentation
	> grunt jsdoc