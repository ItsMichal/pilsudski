var express = require('express');
var app = express();

var madness = 10;
app.get('/', function(rq, rs){
  rs.send("test");
});
app.post('/webhook', function(rq, rs){
  var b = rq.body.parameters.trigger;
  var r = rq.body.result.fulfillment.speech;
  console.log(b);
  madness += b;

  rs.set('Content-Type', 'application/json');
  if(rq.body.parameters.reset == "r"){
    madness = 10;
  }

  if(madness < 0){
    rs.send({"speech": "im mad so ww1 happened", "displayText":"im mad so ww1 happened"});

  }else{
    rs.send({"speech": (r+" Anger Level: " + madness), "displayText":(r+" Anger Level: " + madness)});
  }

});
