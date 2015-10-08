var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Test');

var LogSchema = new mongoose.Schema({
  logs: String,
  trasaction_id: String,
  stage:String,
  hostProperties: Array,
  updated_at: { type: Date, default: Date.now },
});

LogSchema.pre('save', function(next) {
// get the current date
var currentDate = new Date();
// change the updated_at field to current date
this.updated_at = currentDate;
// if created_at doesn't exist, add to that field
if (!this.created_at)
this.created_at = currentDate;
next();
});
      

var log = mongoose.model('Log', LogSchema);
exports.find_log = function(req,cb){

log.findOneAndUpdate({transaction_id:req.id}, {logs:req.note,stage:req.stage,transaction_id: req.id,hostProperties: req.hostProperties},{new: true, upsert: true},cb);
//res.json(data);

}
