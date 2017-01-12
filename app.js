var express = require('express');
var app = express();
var bp = require('body-parser');



var end_mad = 20;
var start_mad = Math.round(end_mad/2);
var madness = start_mad;
var used = [];

app.set('port', (process.env.PORT || 5000));
app.use(bp.json());
app.use(express.static(__dirname + '/public'));
app.get('/', function(rq, rs){
  rs.send("test");
});
console.log("hello");

app.post('/webhook', function(rq, rs){
  console.log(rq);
  var b = rq.body.result.parameters.trigger;
  var r = rq.body.result.fulfillment.speech;
  console.log(b);
  if(!isNaN(b)){
    if(used.indexOf(rq.body.result.metadata.intentName) == -1){
      madness += parseInt(b);
    }
  }


  rs.set('Content-Type', 'application/json');
  var rst = rq.body.result.parameters.reset;
  if(rst == "r"){
    madness = start_mad;
    used = [];
  }else if(!isNaN(rst)){
    end_mad = rst;
    start_mad = Math.round(end_mad/2);
    madness = start_mad;
    used = [];
  }

  if(madness <= 0){
    rs.send({"speech": "im mad so ww1 happened", "displayText":"im mad so ww1 happened"});

  }else if (madness >= end_mad){
    rs.send({"speech": "im happy so ww1 didn't happen", "displayText":"im happy so ww1 didn't happen"});
  }else{
    rs.send({"speech": r +" ", "displayText":(r+" (Temperament: " + madness+")")});
  }
  used.push(rq.body.result.metadata.intentName);
});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
