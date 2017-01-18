"use strict";

var express = require('express');
var app = express();
var bp = require('body-parser');
var fs = require('fs');

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
console.log(config);
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
  rs.send("test");
});

//I'll seperate the logic into a seperate function later, but right now that's unneccessary
//If you want to try adding features, please read over this https://docs.api.ai/docs/webhook, it helps
//Main Logic/Code, this is where API.AI calls me
app.post('/webhook', function(rq, rs){
  //Important, API.AI requires this bit
  rs.set('Content-Type', 'application/json');

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
  //If you lose...
  }else if (curTemper >= winTemper){
    //or If you win
    rs.send({"speech": winResponse, "displayText":winResponse});
  }else{
    //otherwise Display Response and find the appropriate response based on anger and config.json

    //debugging this took forever, thanks to JS's dynamic data types.

    //IT TOOK FOREVER BECAUSE OF A
    //FRIGGIN
    //TYPO

    //rip

    var response = config.responses.neutral;
    if(curTemper > ((3*winTemper)/4)){
      response = config.responses.veryhappy;
    }else if(curTemper > winTemper/2){
      response = config.responses.happy;
    }else if(curTemper < winTemper-((3*winTemper)/4)){
      response = config.responses.veryangry;
    }else if(curTemper < winTemper/2){
      response = config.responses.angry;
    }

    //tells user if they are doing good or nah\
    //terrible logic, idgaf tho
    var feedback = config.responses.same;
    if(!isNaN(temperDelta) && parseInt(temperDelta) != 0){
      feedback = (parseInt(temperDelta) > 0) ? config.responses.good : config.responses.bad;
    }

    //And then just combine the two
    rs.send({"speech": (aiResponse+" "+response+" "+feedback), "displayText":(aiResponse+" "+response+" "+feedback)});
  }

  //Finally, add the current dialogue to the staleTexts. If it's not already there of course
  if(staleTexts.indexOf(intent) == -1)
    staleTexts.push(intent);


  //DEBUG BLOC
  ///*uncomment to debug*/ console.log(rq);
  ///*uncomment to debug*/ console.log(temperDelta);
});

//Have the app actually run on the server
app.listen(app.get('port'), function() {
  console.log('The Kaiser is Listening...He says inverse starboard ', app.get('port'));
});
