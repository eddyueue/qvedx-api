//qvedx.js
var sys = require('sys')
var exec = require('child_process').exec;
var child;
var xml2js = require('xml2js');
var parseString = require('xml2js').parseString;
var wait=require('wait.for');


handleSOAPFault = function(callback,soapFault,result,stdout){
	console.log("SOAPFault",soapFault);

	if(soapFault.faultstring == 'Service key is missing'){
		//handle service key missing?
	}

	callback(soapFault,{stdout: stdout});
}

getSOAPBody = function(soapResult){
	if (soapResult["Envelope"]["Body"]){
		var soapBody = soapResult["Envelope"]["Body"];
		delete soapBody["$"];	
		return soapBody
	}
	return null;
}

getSOAPFault = function(soapResult){
	var soapBody = getSOAPBody(soapResult);
	if(soapBody["Fault"]){
		return soapBody["Fault"];
	}	
	return null;
}

var prefixMatch = new RegExp(/(?!xmlns)^.*:/);
stripPrefix = function(name){
	var str = name;
	var ret = str.replace(prefixMatch, '');
	return ret;
}

function QVEDX(options){
	QVEDX.options = options || {};
	QVEDX.proxy = options.proxy || null;
	QVEDX.protocol = options.protocol || 'http';
	QVEDX.host = options.host || 'localhost';
	QVEDX.port = options.port || 4799;
	QVEDX.endpoint = options.endpoint || 'QMS/Service';
	QVEDX.serviceKey = options.permanentServiceKey || null;
	QVEDX.parserOptions = {explicitArray: false, ignoreAttrs: true, tagNameProcessors:[stripPrefix],attrNameProcessors:[stripPrefix] };
};


QVEDX.prototype.createCurlRequest = function(options){
	var url = QVEDX.protocol + '://' + QVEDX.host + ':' + QVEDX.port + '/' + QVEDX.endpoint;
	var hostname = QVEDX.host + ':' + QVEDX.port;

	var cmds = ["curl -X POST"];

	if(options.verbose){
		cmds.push("-v");
	}	

	if(options.data){
		cmds.push('-d "' + options.data + '"');
	}

	if(options.contentType){
		cmds.push('--header "'+options.contentType+'"');
	} else {
		cmds.push('--header "Content-Type: text/xml; charset=utf-8"');
	}

	if(QVEDX.serviceKey){
		cmds.push('--header "X-Service-Key: ' + QVEDX.serviceKey + '"');
	} else {
		//cmds.push('--header "X-Service-Key:"');
		if(options.soapAction.indexOf('GetTimeLimitedServiceKey') == -1){
			//get service key sync
		}
	}

	if(options.soapAction){
		cmds.push('--header "SOAPAction: \\\"' + options.soapAction + '\\\""');
	}

	cmds.push('--header "Host: ' + hostname + '"');


	//cmds.push('--header "Expect: 100-continue"');
	cmds.push('--header "Accept-Encoding: gzip, deflate"');

	if(true){
		//cmds.push('--header "Authorization: NTLM TlRMTVNTUAADAAAAGAAYAIIAAAAYABgAmgAAAAoACgBYAAAAEAAQAGIAAAAQABAAcgAAAAAAAACyAAAABYKYogYBsR0AAAAPB8m/sZ1Cz/mdpk8mYJlOVVcAVwAwADAAMgBhAGwAYgBpAHMAcwBlAHIATQBEADEARABDAE4AUgBDADIXX6Tb3S0fAAAAAAAAAAAAAAAAAAAAALc4C7AkX+NMsm3RVqxwgWqIbQOuFfdTGg=="');	
	}


	if(true){
		//cmds.push('--header "Expect: 100-continue"');
	}

	if(QVEDX.options.connectTimeout){
		cmds.push('--connect-timeout ' + QVEDX.options.connectTimeout);	
	} else {
		cmds.push('--connect-timeout 5');
	}
	

	if(QVEDX.options.ntlm){
		cmds.push('--ntlm -u ' + QVEDX.options.ntlm.user);
	}

	if(QVEDX.proxy && (this.options.ntlm == false)){
		cmds.push('--proxy ' + options.proxy + '');
	}	

	if(QVEDX.options.trace){
		cmds.push('--trace-ascii trace.txt');
	}

	cmds.push(url);

	return cmds.join(" ");
}


/**
 * GetTimeLimitedServiceKeySync
 */

QVEDX.prototype.GetTimeLimitedServiceKeySync = function (q,callback){
	console.log("GetTimeLimitedServiceKeySync");
	wait.launchFiber(q.GetKey);
}

QVEDX.prototype.GetKey = function (options,callback){
	console.log("GetTimeLimitedServiceKey");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/GetTimeLimitedServiceKey'; //TODO make global

	callback = callback || function () {};

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><GetTimeLimitedServiceKey xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"/></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	var result = wait.for(exec,cmd);


	/*
	parseString(stdout, function (err, result) {
			var key;
			try {
				key = result["s:Envelope"]["s:Body"][0].GetTimeLimitedServiceKeyResponse[0].GetTimeLimitedServiceKeyResult[0];
				QVEDX.serviceKey = key;
			} catch(ex){
				var soapFault = result["s:Envelope"]["s:Body"][0]["s:Fault"];
				return handleSOAPFault(callback,soapFault,result,stdout);
			}
    		callback(err,{serviceKey: key});
		});
	*/
}

/**
 * GetTimeLimitedServiceKey
 */
QVEDX.prototype.GetTimeLimitedServiceKey = function (callback,options){
	console.log("GetTimeLimitedServiceKey");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/GetTimeLimitedServiceKey'; //TODO make global

	callback = callback || function () {};

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><GetTimeLimitedServiceKey xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"/></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		//sys.print('stdout: ' + stdout);
		//sys.print('stderr: ' + stderr);

		parseString(stdout, function (err, result) {
			var key;
			try {
				key = result["s:Envelope"]["s:Body"][0].GetTimeLimitedServiceKeyResponse[0].GetTimeLimitedServiceKeyResult[0];
				QVEDX.serviceKey = key;
			} catch(ex){
				var soapFault = result["s:Envelope"]["s:Body"][0]["s:Fault"];
				return handleSOAPFault(callback,soapFault,result,stdout);
			}
    		callback(err,{serviceKey: key});
		});
	});
}


QVEDX.prototype.Ping = function (callback,options){
	console.log("Ping");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/Ping'; //TODO make global

	callback = callback || function () {};

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><Ping xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"/></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result);
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});			
	});	
}


QVEDX.prototype.FindEDX = function (callback,options){
	console.log("FindEDX");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/FindEDX'; //TODO make global

	callback = callback || function () {};

	if(!options.name){
		return callback({err: 'options.name not defined'});
	}

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><FindEDX xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"><name>'+ options.name +'</name></FindEDX></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result).FindEDXResponse.FindEDXResult;
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});			
	});
}


QVEDX.prototype.GetTaskStatus = function (callback,options){
	console.log("GetTaskStatus");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatus'; //TODO make global

	callback = callback || function () {};

	if(!options.taskId){
		return callback({err: 'options.taskId not defined'});
	}

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><GetTaskStatus xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"><taskID>'+options.taskId+'</taskID><scope>All</scope></GetTaskStatus></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result).GetTaskStatusResponse.GetTaskStatusResult;
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});		
	});
}

QVEDX.prototype.TriggerEDXTask = function (callback,options){
	console.log("TriggerEDXTask");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/TriggerEDXTask'; //TODO make global

	callback = callback || function () {};

	if(!options.taskNameOrID){
		return callback({err: 'options.taskNameOrID not defined'});
	}

	if(!options.password){
		options.password = '<password i:nil="true" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"/>'; //TODO const
	}

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><TriggerEDXTask xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"><qdsID>00000000-0000-0000-0000-000000000000</qdsID><taskNameOrID>'+options.taskNameOrID+'</taskNameOrID><password>test</password><variableName i:nil=\\\"true\\\" xmlns:i=\\\"http://www.w3.org/2001/XMLSchema-instance\\\"/><variableValues i:nil=\\\"true\\\" xmlns:a=\\\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\\\" xmlns:i=\\\"http://www.w3.org/2001/XMLSchema-instance\\\"/></TriggerEDXTask></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result).TriggerEDXTaskResponse.TriggerEDXTaskResult;
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});
	});
}


QVEDX.prototype.GetEDXTaskStatus = function (callback,options){
	console.log("GetEDXTaskStatus");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/GetEDXTaskStatus'; //TODO make global

	callback = callback || function () {};

	if(!options.executionID){
		return callback({err: 'options.executionID not defined'});
	}

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><GetEDXTaskStatus xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"><qdsID>00000000-0000-0000-0000-000000000000</qdsID><executionID>'+options.executionID+'</executionID></GetEDXTaskStatus></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result).GetEDXTaskStatusResponse.GetEDXTaskStatusResult;
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});
	});
}


QVEDX.prototype.GetTaskStatus = function (callback,options){
	console.log("GetTaskStatus");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatus'; //TODO make global

	callback = callback || function () {};

	if(!options.taskID){
		return callback({err: 'options.taskID not defined'});
	}

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><GetTaskStatus xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"><taskID>'+options.taskID+'</taskID><scope>All</scope></GetTaskStatus></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result).GetTaskStatusResponse.GetTaskStatusResult;
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});
	});
}


QVEDX.prototype.AbortTask = function (callback,options){
	console.log("GetTaskStatus");
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/AbortTask'; //TODO make global

	callback = callback || function () {};

	if(!options.taskID){
		return callback({err: 'options.taskID not defined'});
	}

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body><AbortTask xmlns=\\\"http://ws.qliktech.com/QMS/11/\\\"><taskID>'+options.taskID+'</taskID></AbortTask></s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result).GetTaskStatusResponse.GetTaskStatusResult;
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});
	});
}

QVEDX.prototype.GenericAPICall = function (callback,options){
	if(!options.soapAction){
		return callback({err: 'options.soapAction not defined'});
	}

	if(!QVEDX.serviceKey){
		wait.launchFiber(getServiceKey);		
	}

	console.log(options.soapAction);
	var soapAction = 'http://ws.qliktech.com/QMS/11/IQMS/' + options.soapAction;

	callback = callback || function () {};

	if(!options.data){
		return callback({err: 'options.data not defined'});
	}

	var err = null;
	var result = {};

	var cmd = this.createCurlRequest({
		soapAction: soapAction,
		data: '<s:Envelope xmlns:s=\\\"http://schemas.xmlsoap.org/soap/envelope/\\\"><s:Body>'+options.data+'</s:Body></s:Envelope>'
	});

	console.log("Curl Request: " + cmd);
	child = exec(cmd, function (err, stdout, stderr) {
		if(err !== null){
			return callback(err);
		}

		parseString(stdout, QVEDX.parserOptions,  function (err, result) {
			if(err){
				return callback(err);
			}
			var key;
			try {
				var soapResult = getSOAPBody(result)[options.soapAction + 'Response'][options.soapAction + 'Result'];
			} catch(ex){
				var soapFault = getSOAPFault(result);
				if(soapFault){
					return handleSOAPFault(callback,soapFault,result,stdout);
				}
				return callback(ex);
			}
    		callback(err,soapResult);
		});
	});
}



//GetSourceDocuments
//<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetSourceDocuments xmlns="http://ws.qliktech.com/QMS/11/"><qdsID>00000000-0000-0000-0000-000000000000</qdsID></GetSourceDocuments></s:Body></s:Envelope>

//GetTasks
//<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetTasks xmlns="http://ws.qliktech.com/QMS/11/"><qdsID>00000000-0000-0000-0000-000000000000</qdsID></GetTasks></s:Body></s:Envelope>


//GetServices
//<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetServices xmlns="http://ws.qliktech.com/QMS/11/"><serviceTypes>All</serviceTypes></GetServices></s:Body></s:Envelope>POST /QMS/Service HTTP/1.1


//GetServiceStatuses
//<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body><GetServiceStatuses xmlns="http://ws.qliktech.com/QMS/11/"><serviceIDs xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><a:guid>4ecef61a-edf3-4e0c-99c4-d087a7cdd1f8</a:guid></serviceIDs></GetServiceStatuses></s:Body></s:Envelope>



/*
<wsdl:operation name="GetCALInfoForUser">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCALInfoForUser" message="tns:IQMS_GetCALInfoForUser_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCALInfoForUserResponse" message="tns:IQMS_GetCALInfoForUser_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCALInfoForUserExceptionFault" name="ExceptionFault" message="tns:IQMS_GetCALInfoForUser_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetQVSPerformanceData">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSPerformanceData" message="tns:IQMS_GetQVSPerformanceData_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSPerformanceDataResponse" message="tns:IQMS_GetQVSPerformanceData_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSPerformanceDataExceptionFault" name="ExceptionFault" message="tns:IQMS_GetQVSPerformanceData_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetQVSUtilizationData">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSUtilizationData" message="tns:IQMS_GetQVSUtilizationData_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSUtilizationDataResponse" message="tns:IQMS_GetQVSUtilizationData_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSUtilizationDataExceptionFault" name="ExceptionFault" message="tns:IQMS_GetQVSUtilizationData_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetQVSDocumentsPerUser">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSDocumentsPerUser" message="tns:IQMS_GetQVSDocumentsPerUser_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSDocumentsPerUserResponse" message="tns:IQMS_GetQVSDocumentsPerUser_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSDocumentsPerUserExceptionFault" name="ExceptionFault" message="tns:IQMS_GetQVSDocumentsPerUser_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetQVSDocumentsAndUsers">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSDocumentsAndUsers" message="tns:IQMS_GetQVSDocumentsAndUsers_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSDocumentsAndUsersResponse" message="tns:IQMS_GetQVSDocumentsAndUsers_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSDocumentsAndUsersExceptionFault" name="ExceptionFault" message="tns:IQMS_GetQVSDocumentsAndUsers_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetServerObjectMetaDataForUser">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServerObjectMetaDataForUser" message="tns:IQMS_GetServerObjectMetaDataForUser_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServerObjectMetaDataForUserResponse" message="tns:IQMS_GetServerObjectMetaDataForUser_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServerObjectMetaDataForUserExceptionFault" name="ExceptionFault" message="tns:IQMS_GetServerObjectMetaDataForUser_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetServerObjects">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServerObjects" message="tns:IQMS_GetServerObjects_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServerObjectsResponse" message="tns:IQMS_GetServerObjects_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServerObjectsExceptionFault" name="ExceptionFault" message="tns:IQMS_GetServerObjects_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="DeleteServerObject">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteServerObject" message="tns:IQMS_DeleteServerObject_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteServerObjectResponse" message="tns:IQMS_DeleteServerObject_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteServerObjectExceptionFault" name="ExceptionFault" message="tns:IQMS_DeleteServerObject_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="TakeServerObject">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/TakeServerObject" message="tns:IQMS_TakeServerObject_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/TakeServerObjectResponse" message="tns:IQMS_TakeServerObject_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/TakeServerObjectExceptionFault" name="ExceptionFault" message="tns:IQMS_TakeServerObject_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="LookupNames">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/LookupNames" message="tns:IQMS_LookupNames_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/LookupNamesResponse" message="tns:IQMS_LookupNames_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/LookupNamesExceptionFault" name="ExceptionFault" message="tns:IQMS_LookupNames_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetDSResources">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDSResources" message="tns:IQMS_GetDSResources_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDSResourcesResponse" message="tns:IQMS_GetDSResources_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDSResourcesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetDSResources_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ResolveUserGroups">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ResolveUserGroups" message="tns:IQMS_ResolveUserGroups_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ResolveUserGroupsResponse" message="tns:IQMS_ResolveUserGroups_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ResolveUserGroupsExceptionFault" name="ExceptionFault" message="tns:IQMS_ResolveUserGroups_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetAvailableDSProviders">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAvailableDSProviders" message="tns:IQMS_GetAvailableDSProviders_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAvailableDSProvidersResponse" message="tns:IQMS_GetAvailableDSProviders_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAvailableDSProvidersExceptionFault" name="ExceptionFault" message="tns:IQMS_GetAvailableDSProviders_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetAvailableDirectories">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAvailableDirectories" message="tns:IQMS_GetAvailableDirectories_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAvailableDirectoriesResponse" message="tns:IQMS_GetAvailableDirectories_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAvailableDirectoriesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetAvailableDirectories_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SetQVWSAuthentication">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SetQVWSAuthentication" message="tns:IQMS_SetQVWSAuthentication_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SetQVWSAuthenticationResponse" message="tns:IQMS_SetQVWSAuthentication_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SetQVWSAuthenticationExceptionFault" name="ExceptionFault" message="tns:IQMS_SetQVWSAuthentication_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetQVWSAuthentication">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVWSAuthentication" message="tns:IQMS_GetQVWSAuthentication_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVWSAuthenticationResponse" message="tns:IQMS_GetQVWSAuthentication_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVWSAuthenticationExceptionFault" name="ExceptionFault" message="tns:IQMS_GetQVWSAuthentication_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RemoteGetServices">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetServices" message="tns:IQMS_RemoteGetServices_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetServicesResponse" message="tns:IQMS_RemoteGetServices_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetServicesExceptionFault" name="ExceptionFault" message="tns:IQMS_RemoteGetServices_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RemoteGetSourceDocumentFolders">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetSourceDocumentFolders" message="tns:IQMS_RemoteGetSourceDocumentFolders_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetSourceDocumentFoldersResponse" message="tns:IQMS_RemoteGetSourceDocumentFolders_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetSourceDocumentFoldersExceptionFault" name="ExceptionFault" message="tns:IQMS_RemoteGetSourceDocumentFolders_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RemoteGetSourceDocumentNodes">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetSourceDocumentNodes" message="tns:IQMS_RemoteGetSourceDocumentNodes_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetSourceDocumentNodesResponse" message="tns:IQMS_RemoteGetSourceDocumentNodes_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetSourceDocumentNodesExceptionFault" name="ExceptionFault" message="tns:IQMS_RemoteGetSourceDocumentNodes_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RemoteGetTaskListForDocID">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetTaskListForDocID" message="tns:IQMS_RemoteGetTaskListForDocID_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetTaskListForDocIDResponse" message="tns:IQMS_RemoteGetTaskListForDocID_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetTaskListForDocIDExceptionFault" name="ExceptionFault" message="tns:IQMS_RemoteGetTaskListForDocID_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RemoteGetTasks">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetTasks" message="tns:IQMS_RemoteGetTasks_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetTasksResponse" message="tns:IQMS_RemoteGetTasks_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetTasksExceptionFault" name="ExceptionFault" message="tns:IQMS_RemoteGetTasks_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RemoteGetDocumentTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetDocumentTask" message="tns:IQMS_RemoteGetDocumentTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetDocumentTaskResponse" message="tns:IQMS_RemoteGetDocumentTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RemoteGetDocumentTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_RemoteGetDocumentTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ImportDocumentTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ImportDocumentTask" message="tns:IQMS_ImportDocumentTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ImportDocumentTaskResponse" message="tns:IQMS_ImportDocumentTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ImportDocumentTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_ImportDocumentTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ImportAllDocumentTasksForQds">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ImportAllDocumentTasksForQds" message="tns:IQMS_ImportAllDocumentTasksForQds_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ImportAllDocumentTasksForQdsResponse" message="tns:IQMS_ImportAllDocumentTasksForQds_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ImportAllDocumentTasksForQdsExceptionFault" name="ExceptionFault" message="tns:IQMS_ImportAllDocumentTasksForQds_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="InitiateUploadExtensionObject">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/InitiateUploadExtensionObject" message="tns:IQMS_InitiateUploadExtensionObject_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/InitiateUploadExtensionObjectResponse" message="tns:IQMS_InitiateUploadExtensionObject_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/InitiateUploadExtensionObjectExceptionFault" name="ExceptionFault" message="tns:IQMS_InitiateUploadExtensionObject_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="WriteExtensionObject">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/WriteExtensionObject" message="tns:IQMS_WriteExtensionObject_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/WriteExtensionObjectResponse" message="tns:IQMS_WriteExtensionObject_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/WriteExtensionObjectExceptionFault" name="ExceptionFault" message="tns:IQMS_WriteExtensionObject_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="CloseAndInstallExtensionObject">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CloseAndInstallExtensionObject" message="tns:IQMS_CloseAndInstallExtensionObject_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CloseAndInstallExtensionObjectResponse" message="tns:IQMS_CloseAndInstallExtensionObject_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CloseAndInstallExtensionObjectExceptionFault" name="ExceptionFault" message="tns:IQMS_CloseAndInstallExtensionObject_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SaveLicense">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveLicense" message="tns:IQMS_SaveLicense_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveLicenseResponse" message="tns:IQMS_SaveLicense_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveLicenseExceptionFault" name="ExceptionFault" message="tns:IQMS_SaveLicense_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetLicense">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetLicense" message="tns:IQMS_GetLicense_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetLicenseResponse" message="tns:IQMS_GetLicense_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetLicenseExceptionFault" name="ExceptionFault" message="tns:IQMS_GetLicense_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ClearLicense">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearLicense" message="tns:IQMS_ClearLicense_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearLicenseResponse" message="tns:IQMS_ClearLicense_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearLicenseExceptionFault" name="ExceptionFault" message="tns:IQMS_ClearLicense_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="UpdateLicense">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/UpdateLicense" message="tns:IQMS_UpdateLicense_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/UpdateLicenseResponse" message="tns:IQMS_UpdateLicense_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/UpdateLicenseExceptionFault" name="ExceptionFault" message="tns:IQMS_UpdateLicense_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ValidateLicense">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ValidateLicense" message="tns:IQMS_ValidateLicense_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ValidateLicenseResponse" message="tns:IQMS_ValidateLicense_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ValidateLicenseExceptionFault" name="ExceptionFault" message="tns:IQMS_ValidateLicense_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ServiceHasValidLicense">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ServiceHasValidLicense" message="tns:IQMS_ServiceHasValidLicense_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ServiceHasValidLicenseResponse" message="tns:IQMS_ServiceHasValidLicense_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ServiceHasValidLicenseExceptionFault" name="ExceptionFault" message="tns:IQMS_ServiceHasValidLicense_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetQVSSettings">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSSettings" message="tns:IQMS_GetQVSSettings_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSSettingsResponse" message="tns:IQMS_GetQVSSettings_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQVSSettingsExceptionFault" name="ExceptionFault" message="tns:IQMS_GetQVSSettings_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SaveQVSSettings">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveQVSSettings" message="tns:IQMS_SaveQVSSettings_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveQVSSettingsResponse" message="tns:IQMS_SaveQVSSettings_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveQVSSettingsExceptionFault" name="ExceptionFault" message="tns:IQMS_SaveQVSSettings_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetServices">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServices" message="tns:IQMS_GetServices_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServicesResponse" message="tns:IQMS_GetServices_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServicesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetServices_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ClearQVSCache">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearQVSCache" message="tns:IQMS_ClearQVSCache_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearQVSCacheResponse" message="tns:IQMS_ClearQVSCache_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearQVSCacheExceptionFault" name="ExceptionFault" message="tns:IQMS_ClearQVSCache_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetQDSSettings">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQDSSettings" message="tns:IQMS_GetQDSSettings_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQDSSettingsResponse" message="tns:IQMS_GetQDSSettings_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetQDSSettingsExceptionFault" name="ExceptionFault" message="tns:IQMS_GetQDSSettings_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SaveQDSSettings">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveQDSSettings" message="tns:IQMS_SaveQDSSettings_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveQDSSettingsResponse" message="tns:IQMS_SaveQDSSettings_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveQDSSettingsExceptionFault" name="ExceptionFault" message="tns:IQMS_SaveQDSSettings_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SendDistributionServiceWorkorder">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SendDistributionServiceWorkorder" message="tns:IQMS_SendDistributionServiceWorkorder_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SendDistributionServiceWorkorderResponse" message="tns:IQMS_SendDistributionServiceWorkorder_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SendDistributionServiceWorkorderExceptionFault" name="ExceptionFault" message="tns:IQMS_SendDistributionServiceWorkorder_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="IsPublisherQDS">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/IsPublisherQDS" message="tns:IQMS_IsPublisherQDS_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/IsPublisherQDSResponse" message="tns:IQMS_IsPublisherQDS_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/IsPublisherQDSExceptionFault" name="ExceptionFault" message="tns:IQMS_IsPublisherQDS_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetDocumentFolder">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentFolder" message="tns:IQMS_GetDocumentFolder_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentFolderResponse" message="tns:IQMS_GetDocumentFolder_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentFolderExceptionFault" name="ExceptionFault" message="tns:IQMS_GetDocumentFolder_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetUserDocumentFolders">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentFolders" message="tns:IQMS_GetUserDocumentFolders_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentFoldersResponse" message="tns:IQMS_GetUserDocumentFolders_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentFoldersExceptionFault" name="ExceptionFault" message="tns:IQMS_GetUserDocumentFolders_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetSourceDocumentFolders">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentFolders" message="tns:IQMS_GetSourceDocumentFolders_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentFoldersResponse" message="tns:IQMS_GetSourceDocumentFolders_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentFoldersExceptionFault" name="ExceptionFault" message="tns:IQMS_GetSourceDocumentFolders_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetSourceDocuments">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocuments" message="tns:IQMS_GetSourceDocuments_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentsResponse" message="tns:IQMS_GetSourceDocuments_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentsExceptionFault" name="ExceptionFault" message="tns:IQMS_GetSourceDocuments_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetSourceDocumentNodes">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentNodes" message="tns:IQMS_GetSourceDocumentNodes_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentNodesResponse" message="tns:IQMS_GetSourceDocumentNodes_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSourceDocumentNodesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetSourceDocumentNodes_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetUserDocuments">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocuments" message="tns:IQMS_GetUserDocuments_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentsResponse" message="tns:IQMS_GetUserDocuments_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentsExceptionFault" name="ExceptionFault" message="tns:IQMS_GetUserDocuments_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetUserDocumentNodes">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentNodes" message="tns:IQMS_GetUserDocumentNodes_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentNodesResponse" message="tns:IQMS_GetUserDocumentNodes_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetUserDocumentNodesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetUserDocumentNodes_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SaveDocumentTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveDocumentTask" message="tns:IQMS_SaveDocumentTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveDocumentTaskResponse" message="tns:IQMS_SaveDocumentTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveDocumentTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_SaveDocumentTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetTasks">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTasks" message="tns:IQMS_GetTasks_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTasksResponse" message="tns:IQMS_GetTasks_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTasksExceptionFault" name="ExceptionFault" message="tns:IQMS_GetTasks_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTask" message="tns:IQMS_GetTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskResponse" message="tns:IQMS_GetTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_GetTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="FindTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/FindTask" message="tns:IQMS_FindTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/FindTaskResponse" message="tns:IQMS_FindTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/FindTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_FindTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="FindEDX">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/FindEDX" message="tns:IQMS_FindEDX_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/FindEDXResponse" message="tns:IQMS_FindEDX_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/FindEDXExceptionFault" name="ExceptionFault" message="tns:IQMS_FindEDX_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetTasksForDocument">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTasksForDocument" message="tns:IQMS_GetTasksForDocument_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTasksForDocumentResponse" message="tns:IQMS_GetTasksForDocument_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTasksForDocumentExceptionFault" name="ExceptionFault" message="tns:IQMS_GetTasksForDocument_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetDocumentTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentTask" message="tns:IQMS_GetDocumentTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentTaskResponse" message="tns:IQMS_GetDocumentTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_GetDocumentTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="DeleteTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteTask" message="tns:IQMS_DeleteTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteTaskResponse" message="tns:IQMS_DeleteTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_DeleteTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RunTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RunTask" message="tns:IQMS_RunTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RunTaskResponse" message="tns:IQMS_RunTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RunTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_RunTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="AbortTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/AbortTask" message="tns:IQMS_AbortTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/AbortTaskResponse" message="tns:IQMS_AbortTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/AbortTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_AbortTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetCategories">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCategories" message="tns:IQMS_GetCategories_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCategoriesResponse" message="tns:IQMS_GetCategories_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCategoriesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetCategories_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetAlertText">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAlertText" message="tns:IQMS_GetAlertText_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAlertTextResponse" message="tns:IQMS_GetAlertText_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetAlertTextExceptionFault" name="ExceptionFault" message="tns:IQMS_GetAlertText_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetServiceStatuses">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServiceStatuses" message="tns:IQMS_GetServiceStatuses_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServiceStatusesResponse" message="tns:IQMS_GetServiceStatuses_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetServiceStatusesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetServiceStatuses_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="Ping">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/Ping" message="tns:IQMS_Ping_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/PingResponse" message="tns:IQMS_Ping_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/PingExceptionFault" name="ExceptionFault" message="tns:IQMS_Ping_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetTaskStatusNodes">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatusNodes" message="tns:IQMS_GetTaskStatusNodes_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatusNodesResponse" message="tns:IQMS_GetTaskStatusNodes_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatusNodesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetTaskStatusNodes_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetTaskStatuses">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatuses" message="tns:IQMS_GetTaskStatuses_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatusesResponse" message="tns:IQMS_GetTaskStatuses_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatusesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetTaskStatuses_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetTaskStatus">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatus" message="tns:IQMS_GetTaskStatus_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatusResponse" message="tns:IQMS_GetTaskStatus_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTaskStatusExceptionFault" name="ExceptionFault" message="tns:IQMS_GetTaskStatus_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetTimeLimitedServiceKey">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTimeLimitedServiceKey" message="tns:IQMS_GetTimeLimitedServiceKey_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTimeLimitedServiceKeyResponse" message="tns:IQMS_GetTimeLimitedServiceKey_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetTimeLimitedServiceKeyExceptionFault" name="ExceptionFault" message="tns:IQMS_GetTimeLimitedServiceKey_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetSectionAccessTables">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTables" message="tns:IQMS_GetSectionAccessTables_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTablesResponse" message="tns:IQMS_GetSectionAccessTables_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTablesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetSectionAccessTables_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetSectionAccessTable">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTable" message="tns:IQMS_GetSectionAccessTable_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTableResponse" message="tns:IQMS_GetSectionAccessTable_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTableExceptionFault" name="ExceptionFault" message="tns:IQMS_GetSectionAccessTable_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetSectionAccessTableByName">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTableByName" message="tns:IQMS_GetSectionAccessTableByName_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTableByNameResponse" message="tns:IQMS_GetSectionAccessTableByName_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetSectionAccessTableByNameExceptionFault" name="ExceptionFault" message="tns:IQMS_GetSectionAccessTableByName_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SaveSectionAccessTable">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveSectionAccessTable" message="tns:IQMS_SaveSectionAccessTable_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveSectionAccessTableResponse" message="tns:IQMS_SaveSectionAccessTable_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveSectionAccessTableExceptionFault" name="ExceptionFault" message="tns:IQMS_SaveSectionAccessTable_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="DeleteSectionAccessTable">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteSectionAccessTable" message="tns:IQMS_DeleteSectionAccessTable_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteSectionAccessTableResponse" message="tns:IQMS_DeleteSectionAccessTable_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/DeleteSectionAccessTableExceptionFault" name="ExceptionFault" message="tns:IQMS_DeleteSectionAccessTable_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="TriggerEDXTask">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/TriggerEDXTask" message="tns:IQMS_TriggerEDXTask_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/TriggerEDXTaskResponse" message="tns:IQMS_TriggerEDXTask_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/TriggerEDXTaskExceptionFault" name="ExceptionFault" message="tns:IQMS_TriggerEDXTask_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetEDXTaskStatus">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetEDXTaskStatus" message="tns:IQMS_GetEDXTaskStatus_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetEDXTaskStatusResponse" message="tns:IQMS_GetEDXTaskStatus_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetEDXTaskStatusExceptionFault" name="ExceptionFault" message="tns:IQMS_GetEDXTaskStatus_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RestartQDS">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RestartQDS" message="tns:IQMS_RestartQDS_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RestartQDSResponse" message="tns:IQMS_RestartQDS_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RestartQDSExceptionFault" name="ExceptionFault" message="tns:IQMS_RestartQDS_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="QDSNeedRestart">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/QDSNeedRestart" message="tns:IQMS_QDSNeedRestart_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/QDSNeedRestartResponse" message="tns:IQMS_QDSNeedRestart_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/QDSNeedRestartExceptionFault" name="ExceptionFault" message="tns:IQMS_QDSNeedRestart_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="CreateSession">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CreateSession" message="tns:IQMS_CreateSession_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CreateSessionResponse" message="tns:IQMS_CreateSession_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CreateSessionExceptionFault" name="ExceptionFault" message="tns:IQMS_CreateSession_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="CloseSession">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CloseSession" message="tns:IQMS_CloseSession_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CloseSessionResponse" message="tns:IQMS_CloseSession_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/CloseSessionExceptionFault" name="ExceptionFault" message="tns:IQMS_CloseSession_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="AddSelections">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/AddSelections" message="tns:IQMS_AddSelections_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/AddSelectionsResponse" message="tns:IQMS_AddSelections_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/AddSelectionsExceptionFault" name="ExceptionFault" message="tns:IQMS_AddSelections_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetFieldContentList">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetFieldContentList" message="tns:IQMS_GetFieldContentList_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetFieldContentListResponse" message="tns:IQMS_GetFieldContentList_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetFieldContentListExceptionFault" name="ExceptionFault" message="tns:IQMS_GetFieldContentList_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetFieldList">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetFieldList" message="tns:IQMS_GetFieldList_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetFieldListResponse" message="tns:IQMS_GetFieldList_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetFieldListExceptionFault" name="ExceptionFault" message="tns:IQMS_GetFieldList_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetDocumentBookmarkNames">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentBookmarkNames" message="tns:IQMS_GetDocumentBookmarkNames_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentBookmarkNamesResponse" message="tns:IQMS_GetDocumentBookmarkNames_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentBookmarkNamesExceptionFault" name="ExceptionFault" message="tns:IQMS_GetDocumentBookmarkNames_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="ClearSelections">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearSelections" message="tns:IQMS_ClearSelections_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearSelectionsResponse" message="tns:IQMS_ClearSelections_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/ClearSelectionsExceptionFault" name="ExceptionFault" message="tns:IQMS_ClearSelections_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetReports">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetReports" message="tns:IQMS_GetReports_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetReportsResponse" message="tns:IQMS_GetReports_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetReportsExceptionFault" name="ExceptionFault" message="tns:IQMS_GetReports_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="RestartQVS">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RestartQVS" message="tns:IQMS_RestartQVS_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RestartQVSResponse" message="tns:IQMS_RestartQVS_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/RestartQVSExceptionFault" name="ExceptionFault" message="tns:IQMS_RestartQVS_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="QVSNeedRestart">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/QVSNeedRestart" message="tns:IQMS_QVSNeedRestart_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/QVSNeedRestartResponse" message="tns:IQMS_QVSNeedRestart_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/QVSNeedRestartExceptionFault" name="ExceptionFault" message="tns:IQMS_QVSNeedRestart_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetDocumentMetaData">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentMetaData" message="tns:IQMS_GetDocumentMetaData_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentMetaDataResponse" message="tns:IQMS_GetDocumentMetaData_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetDocumentMetaDataExceptionFault" name="ExceptionFault" message="tns:IQMS_GetDocumentMetaData_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SaveDocumentMetaData">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveDocumentMetaData" message="tns:IQMS_SaveDocumentMetaData_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveDocumentMetaDataResponse" message="tns:IQMS_SaveDocumentMetaData_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveDocumentMetaDataExceptionFault" name="ExceptionFault" message="tns:IQMS_SaveDocumentMetaData_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="GetCALConfiguration">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCALConfiguration" message="tns:IQMS_GetCALConfiguration_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCALConfigurationResponse" message="tns:IQMS_GetCALConfiguration_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/GetCALConfigurationExceptionFault" name="ExceptionFault" message="tns:IQMS_GetCALConfiguration_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    <wsdl:operation name="SaveCALConfiguration">
      <wsdl:input wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveCALConfiguration" message="tns:IQMS_SaveCALConfiguration_InputMessage" />
      <wsdl:output wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveCALConfigurationResponse" message="tns:IQMS_SaveCALConfiguration_OutputMessage" />
      <wsdl:fault wsaw:Action="http://ws.qliktech.com/QMS/11/IQMS/SaveCALConfigurationExceptionFault" name="ExceptionFault" message="tns:IQMS_SaveCALConfiguration_ExceptionFault_FaultMessage" />
    </wsdl:operation>
    */

module.exports = QVEDX;