var express = require("express");
var bodyParser = require('body-parser');
var path    = require("path");
var ObjectId = require('mongodb').ObjectID;
//var mongojs = require("mongojs");
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://ac-00072810.devapollogrp.edu/TransactionStatus');
//var mongodb = mongoose.connection;
var log = require('./models/test');
var url = require('url');
var MongoClient = require('mongodb').MongoClient,
  format = require('util').format;

var app     = express();
app.use(bodyParser()); // for parsing application/json

app.use(bodyParser.json())

// parse application/vnd.api+json as json
 app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

app.set('view engine', 'ejs');
//app.set('views', require('path').join(__dirname, 'views'));  


app.use(express.static(__dirname + '/public'));

var uri = 'mongodb://ac-00072810.devapollogrp.edu:27017/devdb';


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
  });
  

app.get('/sitemap',function(request,response){
//var queryObject = url.parse(request.url,true);
var query =  JSON.stringify(request.query.transaction_id).replace(/(^"|"$)/g, '').replace(/\s+/, "") ;
var servicename =  JSON.stringify(request.query.servicename).replace(/(^"|"$)/g, '').replace(/\s+/, "") ;
var serviceversion =  JSON.stringify(request.query.serviceversion).replace(/(^"|"$)/g, '').replace(/\s+/, "") ;
console.log(query);
var transaction_details = function(callback) {
MongoClient.connect(uri,function(err,db){
db.collection('TransactionStatus',function(err,collection){
if(err)
{
console.log("ERROR");
throw err;
}
else{
collection.findOne({_id:query},function(err, doc){
    callback(doc);
db.close();
});
}
})
})
}

transaction_details(function(data) {
console.log(data);
response.render('sitemap', {details:data,servicename: servicename,serviceversion:serviceversion});
});
});

app.post('/getstatus',function(request,response){
var merge = require('merge'), // npm install -g merge
    original, cloned;
var transaction_id = request.body.id.replace(/(^"|"$)/g, '');
//console.log("Transaction_id:"+transaction_id);
var transaction_details = function(callback) {
MongoClient.connect(uri,function(err,db){
db.collection('TransactionStatus',function(err,table){
if(err)
{
console.log("ERROR");
throw err;
}
else{
console.log(transaction_id);
table.findOne({_id:transaction_id},function(err, doc){
     console.log("Result doc:"+JSON.stringify(doc));
     callback(doc);
    db.close();
     });
    }
  })
//db.close();
 })
}
transaction_details(function(data) {
if(data.workFlowDone=="IN_PROGRESS"){
merge(data,{stage: "1",status:"provision is in progress"});
log.find_log({id: data._id,note: "1)Provisioning has started'\n'",stage: data.stage},function(err,doc){console.log("data:"+data+"doc:"+doc);merge(data,{logs:doc.logs})});
response.status(200).json(data);
}
else if (data.workFlowDone=="COMPLETED"){
var hostDetails = function(callback){
MongoClient.connect(uri,function(err,db){
db.collection('HostInfo',function(err,table){
if(err)
{
console.log("ERROR");
throw err;
}
else{
table.findOne({transactionId:[transaction_id]},function(err, doc){
       log.find_log({id: data._id,note: "1)Provisioning has completed'\n'",stage: data.stage,hostProperties: doc.hostProperties},function(err,doc){});
        callback(doc)
        db.close();
     })
    }
  })
})
}
hostDetails(function(host_info){
merge(data,{stage: 2, status: "completed",logs: host_info.hostProperties});
console.log("THE FINAL DATA"+JSON.stringify(data.logs));
response.status(200).json(data);
})
//merge(data,{stage: "2",status:"completed"});
//log.find_log({id: data._id,note: "1)Provisioning has completed'\n'",stage: data.stage},function(err,doc){console.log("data:"+data+"doc:"+doc);merge(data,{logs:doc.logs})});
//var logdetails = log.find_log({id: data._id,note: "Provisioning has completed, 2) IS_REACHABLE is in progress",stage: data.stage});

}
//console.log("THE FINAL DATA"+JSON.stringify(data));
//response.status(200).json(data);
//})
})
})
app.listen(3001);
console.log("Running at Port 3001");
