qvedx-api v0.1.0
=====

Node Module for the [QlikView Management Serice API](http://community.qlik.com/docs/DOC-2683) (QMS API) (BETA) 

# Pre Requisites
The QVEDX-API requires a CURL installation to communicate with the QlikView Management Service using NTLM authentication. (Tested with CURL Version 7.37.0) 

Install CURL from [http://www.confusedbycode.com/](http://www.confusedbycode.com/curl/#downloads) 

**Important**: Add CURL executable to path environment variable
	
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
	        password: "password"
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
See doc/index.htm

# Working API Methods
- Trigger a QlikView QMS EDX Task - TriggerEDXTask
- Get EDX Task Status - GetEDXTaskStatus
- Get QlikView Services - GetServices
- Query User Documents - GetUserDocuments
- Query Document Meta Data - GetDocumentMetaData
- Get CAL Info for User - GetCALInfoForUser
- Lookup User Names - LookupNames
Detailed API-Documentation is in the doc/ folder.

## Examples ##
- trigger.js - Triggering an EDX Task
- trigger-status.js - Triggering an EDX Task and periodically check status until finished
- cal-info.js - Get CAL Info for a User
- cal-management - Display's a User Documents and assigned Document CAL's
- lookup-names.js - Lookup a User in the Directory Service Connector Service
See [examples/](./examples/README.md) directory

#Development
- Update Documentation
	> grunt generate-docs


#TODO / Next Steps
- Getting Started Tutorial
- Test and Document all API-Methods
- Add Variables-Support for Triggering EDX Tasks
- Higher Level Services
	- Add / Remove Document CAL's for User
	- Trigger Task and Track Status of subsequent Tasks until all Task's are finished

#License
Copyright (c) 2014, Pom Albisser

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.