// ad required packages
 var mongoose = require('mongoose');
var path    = require("path");


//mongoose.connect('mongodb://10.87.211.183/Boomstick');
//var db = mongoose.Connection;
//if (db=='undefined'){
//console.log('Connection issue');
//}


 var TransactionSchema   = new mongoose.Schema({
    _class: String,
     actionList: String,
     workflowProgress: Array,
     workFlowDone: String,
     logSummary: String,
     source: String,
     createdTime: Date,
     lastUpdatedBy: String,
     lastUpdatedTime: Date
       });

   // on every save, add the date
    TransactionSchema.pre('save', function(next) {
      // get the current date
        var currentDate = new Date();
          
            // change the updated_at field to current date
              this.lastUpdatedTime = currentDate;
   
                // if created_at doesn't exist, add to that field
                  if (!this.createdTime)
                      this.createdTime = currentDate;
   
                        next();
                        });

       // Export the Mongoose model
      var transummary = mongoose.model('TransactionSummary', TransactionSchema);

       exports.add_summary = function(req,res){
       var summary = {_class : "edu.apollo.lp.auto.dbcommons.dto.TransactionStatus", actionList : "IS_REACHABLE,INSTALL_CHEF_DOCKER,IS_REACHABLE,DOCKER_INIT", workflowProgress : [ ], workFlowDone : "IN_PROGRESS", logSummary : "Initializing Docker", source : "UI",lastUpdatedBy: 'Gourab'}
   // console.log("Transaction summary");    
    transummary.create(summary,function(addError,addedSummary){

          if(addError)
           {
             console.log("ERROR");
           res.send(500,{error: addError})
             }
           else
            {
          console.log("SUCCESS");
          //res.redirect('/about');                                         
          res.render('about.ejs',{summary: addedSummary});                                         

         //response.send({success:true, summary: addedsSummary})
           //res.send({summary: addedSummary}); 
           //next();
    //     console.log(addedSummary);
          }   
});
};

     exports.find_details = function(req,res){
    //console.log(req);
     transummary.find({},function(error,transaction_details){
     if(error)
     {
     console.log("ERROR");
     res.send(500,{error:error});
     }      
    else
    {
     console.log("SUCCESS");
     res.render(path.join(__dirname+'/sitemap.ejs'),{details:transaction_details});
     //res.render('/sitemap.ejs',{users:users});
    }
});
};       
