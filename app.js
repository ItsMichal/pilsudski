var express = require('express');
var app = express();
var bp = require('body-parser');

var madness = 10;

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
    madness += parseInt(b);
  }


  rs.set('Content-Type', 'application/json');
  if(rq.body.result.parameters.reset == "r"){
    madness = 10;
  }

  if(madness < 0){
    rs.send({"speech": "im mad so ww1 happened", "displayText":"im mad so ww1 happened"});

  }else{
    rs.send({"speech": (r+" Anger Level: " + madness), "displayText":(r+" Anger Level: " + madness)});
  }

});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
