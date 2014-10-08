Global
===





---

module:QVEDX
===
QVEDX module.

module:QVEDX.GetTimeLimitedServiceKey(options, callback, callback.err, callback.value) 
-----------------------------
Get Time Limited Service Key

**Parameters**

**options**: object&#x2F;function, Options or Callback

**callback**: function, Callback

**callback.err**: object, Error

**callback.value**: object, Service Key

module:QVEDX.TriggerEDXTask(options, options.taskNameOrID, options.password, callback, callback.err, callback.value) 
-----------------------------
Trigger EDX Task

**Parameters**

**options**: object, Options

**options.taskNameOrID**: string, Task Name or Task ID

**options.password**: string, Password

**callback**: function, Callback

**callback.err**: object, Error

**callback.value**: object, Status Result

module:QVEDX.GetServices(options, options.serviceTypes, callback, callback.err, callback.value, callback.value.ServiceInfo) 
-----------------------------
Get Services

**Parameters**

**options**: object&#x2F;function, Options or Callback

**options.serviceTypes**: string, Service Types

**callback**: function, Callback

**callback.err**: object, Error

**callback.value**: object, Services

**callback.value.ServiceInfo**: object, ServiceInfo

module:QVEDX.GetUserDocuments(options, options.qvsID, callback, callback.err, callback.value, callback.value.DocumentNode) 
-----------------------------
Get User Documents

**Parameters**

**options**: object, Options

**options.qvsID**: object, QVS ID

**callback**: function, Callback

**callback.err**: object, Error

**callback.value**: object, User Documents

**callback.value.DocumentNode**: array, DocumentNode

module:QVEDX.GetDocumentMetaData(options, options.documentNode, options.scope, callback, callback.err, callback.value) 
-----------------------------
See {@link QVEDX#GetUserDocuments}.

**Parameters**

**options**: object, Options

**options.documentNode**: object, DocumentNode

**options.scope**: object, Scope

**callback**: function, Callback

**callback.err**: object, Error

**callback.value**: object, Document Meta Data



---








