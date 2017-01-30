"use strict";
var express = require('express');
var app = express();
var bp = require('body-parser');
var fs = require('fs');
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var https = require('https');
var urlParse  = require('url').parse;
var googleTTS = require('google-tts-api');
var lame = require('lame');
var wav = require('wav');
/**
* Author: Michal Bodzianowski C 2017
* MIT license
*
* Desc
*
* This is basic game logic for Ciegielski's game.  If you would like to improve this code, send the revisions to me.
* Enjoy!
*
* TODO: Nothing really much else. Maybe add some more features? Idk what tho
*/


//Get Data from Config
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

//Target temperament for victory. The higher the Temperament, the better. Set by default to 20 (The default lose temperament is zero and cannot be changed)
var winTemper = config.setup.winTemperament;

//Initial temperament. For simplicity, set in between the winTemp and loseTemp UPDATE: uses config.json value
var initTemper = (config.setup.startTemperament > winTemper) ? Math.round(winTemper/2) : config.setup.startTemperament;

//Current temperament.
var curTemper = initTemper;

//Checks to see if a dialogue has already been said and stores it here
var staleTexts = [];

//Port setup for hosting platform. Should be 8080 not 5000 by convention but who cares eh
app.set('port', (process.env.PORT || 5000));

//Sets up express to use json interpreter so I can parse the incoming json request from API.AI
app.use(bp.json());

//Probably unneccessary but convention (and ctrl+c / ctrl+v from debugging heroku.com)
app.use(express.static(__dirname + '/public'));


//You can delete this, its pretty unneccessary.
app.get('/', function(rq, rs){
  rs.sendFile(path.join(__dirname + '/app.html'));
});

app.get(['/final.mp3', '/final.mp3*'], function(rq, rs){
  rs.sendFile(path.join(__dirname + '/final.mp3'));
});

io.on('connection', function(socket){
  console.log("user connected");
});

//I'll seperate the logic into a seperate function later, but right now that's unneccessary
//If you want to try adding features, please read over this https://docs.api.ai/docs/webhook, it helps
//Main Logic/Code, this is where API.AI calls me
app.post('/webhook', function(rq, rs){
  //Important, API.AI requires this bit
  rs.set('Content-Type', 'application/json');
  //response
  var response = "";

  //the change in temper value, derived from the JSON given to me from API.AI. the students will change/set this value in API.AI (video tutorial coming soon)
  //might be null/NaN
  var temperDelta = rq.body.result.parameters.trigger;

  //the default response that API.AI wants to give out. I keep it so that it CAN give it back out. Allows students to create custom responses in API.AI without delving in here
  var aiResponse = rq.body.result.fulfillment.speech;

  //The name of the intent. Intents are an integral part of API.AI. You should know what they are before proceeding,
  var intent = rq.body.result.metadata.intentName;

  //A user passed variable, called reset, used for setup/admin stuffs. I should probably rename it since it doesn't handle JUST resets anymore.
  //might be null/NaN
  var rst = rq.body.result.parameters.reset;

  //I check to see if the students made temperDelta a number. Highly important
  if(!isNaN(temperDelta)){
    //I check to see if the response is not stale (so they can't spam 1 question and win). If it is temperament doesn't change. Uncomment that bit to only enable staling for positive bonuses
    //This means if you keep saying something "bad" it will keep deducting temperament points.
    if(staleTexts.indexOf(intent) == -1 /*|| temperDelta < 0*/){
      //finally just add the value to the curTemper, updating it.
      curTemper += parseInt(temperDelta);
    }else{
      //do what you said here
      rs.send({"speech":(config.responses.stale + " " + aiResponse), "displayText":(config.responses.stale + " " + aiResponse)});
      tts((config.responses.stale + " " + aiResponse));
    }
  }

  //Reset logic
  //Reset the game and its vars if its set to just r
  if(rst == "r"){
    curTemper = initTemper;
    staleTexts = [];
  }else if(!isNaN(rst)){
    //or, if its a number, reset the game AND setup a new initial value for winTemper/initTemper
    winTemper = rst;
    initTemper = Math.round(winTemper/2);
    curTemper = initTemper;
    staleTexts = [];
  }

  //I just made these vars so they are easier to edit. Self-explanatory
  var loseResponse = config.responses.lose;
  var winResponse = config.responses.win;
  //If you lose...
  if(curTemper <= 0){

    rs.send({"speech": loseResponse, "displayText":loseResponse});
    tts(aiResponse+" "+loseResponse);
  //If you lose...
  }else if (curTemper >= winTemper){
    //or If you win
    rs.send({"speech": winResponse, "displayText":winResponse});
    tts(aiResponse+" "+winResponse);
  }else{
    //otherwise Display Response and find the appropriate response based on anger and config.json
    console.log(response + " & " + JSON.stringify(config.responses) + "&" + config.responses.neutral + "&" +config.responses.happy);

    if(curTemper > (winTemper-(curTemper/4))){
      repsonse = config.responses.veryhappy;
    }else if(curTemper > (winTemper-curTemper/2)){
      repsonse = config.responses.happy;
    }else if(curTemper < curTemper/2){
      response = config.responses.angry;
    }else if(curTemper < ((3*curTemper)/4)){
      response = config.responses.veryangry;
    }else{
      response = config.responses.neutral;
    }
    //And then just combine the two
    rs.send({"speech": (aiResponse+" "+response), "displayText":(aiResponse+" "+response)});
    tts(aiResponse+" "+response);

  }

  //Finally, add the current dialogue to the staleTexts. If it's not already there of course
  if(staleTexts.indexOf(intent) == -1)
    staleTexts.push(intent);


  //DEBUG BLOC
  ///*uncomment to debug*/ console.log(rq);
  ///*uncomment to debug*/ console.log(temperDelta);
});


//COOL STFUU

//TTS block
//from google-tts
function downloadFile (url, dest) {
  return new Promise(function (resolve, reject) {
    var info = urlParse(url);
    var httpClient = info.protocol === 'https:' ? https : http;
    var options = {
      host: info.host,
      path: info.path,
      headers: {

        'Accept-Language': 'en-US',
        'Authorization': 'Bearer c1f828342331434c97ca20be01c3e317'

      }
    };

    httpClient.get(options, function(res) {
      // check status code
      if (res.statusCode !== 200) {
        reject(new Error('request to ' + url + ' failed, status code = ' + res.statusCode + ' (' + res.statusMessage + ')'));
        return;
      }

      var file = fs.createWriteStream(dest);
      file.on('finish', function() {
        // close() is async, call resolve after close completes.
        ptchshift();
        file.close(resolve);

      });
      file.on('error', function (err) {
        // Delete the file async. (But we don't check the result)
        fs.unlink(dest);
        reject(err);
      });

      res.pipe(file);
    })
    .on('error', function(err) {
      reject(err);
    })
    .end();
  });
}


//tts("In spite of the fact that we have no such fleet as we should have, we have conquered for ourselves a place in the sun. It will now be my task to see to it that this place in the sun shall remain our undisputed possession, in order that the sun's rays may fall fruitfully upon our activity and trade in foreign parts, that our industry and agriculture may develop within the state and our sailing sports upon the water, for our future lies upon the water.")

function tts(x){
  googleTTS(x, 'de', 1.9)
  .then(function (url) {
    console.log(url); // https://translate.google.com/translate_tts?...
    var nurl = "https://api.api.ai/v1/tts?text="+encodeURIComponent(x)+"";
    console.log(nurl);
    var dest = path.resolve(__dirname, 'base.wav'); // file destination
    console.log('Download to ' + dest + ' ...');

    return downloadFile(nurl, dest);
  })
  .then(function () {
    console.log('Download success');

  })
  .catch(function (err) {
    console.error(err.stack);
  });


}

//sample rate
var sr = 24000  ;
// var encoder = new lame.Encoder({
//   // input
//   channels: 2,        // 2 channels (left and right)
//   bitDepth: 16,       // 16-bit samples
//   sampleRate: 44100,  // 44,100 Hz sample rate
//
//   // output
//   bitRate: 128,
//   outSampleRate: sr/2,
//   mode: lame.STEREO // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
// });
var decoder = new lame.Decoder();
var inputsound;
var outputsound;
function onFormat (format) {
  console.error('WAV format: %j', format);
  var mformat = format;
  mformat.sampleRate = 17000;
  // encoding the wave file into an MP3 is as simple as calling pipe()
  var encoder = new lame.Encoder(mformat);
  decoder.pipe(encoder).pipe(outputsound);
  console.log("done");
  io.emit('audio-update');
}

function ptchshift(){
  inputsound = fs.createReadStream("base.wav");
  outputsound = fs.createWriteStream("final.mp3");
  decoder = new wav.Reader();
  decoder.on('format', onFormat);
  inputsound.pipe(decoder);

  //old broken stuff
  // var ac = new AudioContext();
  // ac.outStream = fs.createWriteStream('final.mp3');
  // var vaw = ac.createBufferSource();
  // fs.readFile(__dirname + 'base.mp3', function(err, buffer) {
  //   if (err) throw err
  //   ac.decodeAudioData(buffer, function(audioBuffer) {
  //     vaw = ac.createBufferSource()
  //     vaw.connect(ac.destination)
  //     vaw.buffer = audioBuffer
  //   });
  // });
  // var ps = PitchShift(ac);
  // ps.connect(ac.destination);
  // ps.transpose = -12;
  // vaw.connect(ps);
  // vaw.start();
  // vaw.stop(ac.currenttime + x);
  // ac.outStream.end();
}




//Have the app actually run on the server
http.listen(app.get('port'), function() {
  console.log('The Kaiser is Listening...He says inverse starboard ', app.get('port'));
});
