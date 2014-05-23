//test.js

var QVEDX = require('./index.js')
	, qvedx = new QVEDX();

console.dir(qvedx);


qvedx.GetTimeLimitedServiceKey(function(err,result){
	console.log("result",result);
});