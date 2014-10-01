qvedx
=====

Node Module for triggering EDX Tasks in QlikView (QMS API)

# Installation

    npm install pomalbisser/qvedx

## Example:
	var wait = require('wait.for');

	// Configuration
	var appConfig = {
	    EDXApiSettings: {
	        //proxy: "http://localhost:3128",
	        host: "<QMS-HOST>",
	        port: 4799,
	        ntlm: {user: '<DOMAIN>\\<USER>:<PASSWORD>'},
	        trace: true,
	        connectTimeout: 5,
	        requestLog: true
	    }
	};

    var QVEDX = require('./index')
    , q = new QVEDX(appConfig.EDXApiSettings);

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

# Features
- trigger QlikView QMS EDX Task
