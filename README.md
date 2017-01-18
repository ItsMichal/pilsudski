# Pilsudski
<img src="https://s-media-cache-ak0.pinimg.com/564x/92/40/de/9240decff227ba682e39b149157a5ad1.jpg" width="111px" height="150px">

Custom made API-AI webhook. Michal Bodzianowski C 2017, MIT License, v1.1.2

Named after the leader of Polish troops during WW1

Report bugs to michal.bodzianowski@stemhigh.org

# Youtube Video Guide

[![video tutorial](http://img.youtube.com/vi/qcjxwh1tkck/0.jpg)](http://www.youtube.com/watch?v=qcjxwh1tkck "Pilsudski Tutorial")

If the instructions are not clear enough for you, I made a video as well. This is a complete guide to integrating Pilsudski with API.AI

Video URL: https://www.youtube.com/watch?v=qcjxwh1tkck

# Installation

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://dashboard.heroku.com/new?template=https%3A%2F%2Fgithub.com%2FItsMichal%2Fciegielsk-ai-backend%2Ftree%2Fmaster)

1. First, please deploy to Heroku
(create an account if you don't have one)
2. Find your Heroku App URL (usually \<app-name>.heroku.com) and remember it.
3. Create an API.AI agent, set up and build as normal
4. Go to 'Fulfillment'
5. Enter \<app-name>.heroku.com/webhook in the URL section, and Save (Also, make sure that webhook is enabled on ALL domains)

And there you are done.

# Configuration

1. Go to an Intent you wish to configure in API.AI
2. Under Parameters, enter one of the parameter names (i.e., enter in 'trigger')
3. Assign the appropriate Entity type according to the chart below (i.e., @sys.number-integer for trigger)
4. Enter an appropriate Value (i.e., for 'trigger', any integer works)
5. Once done, under Fulfillment, click 'Use webhook'
6. Save, and repeat for all other intents

## Parameter Chart

| Parameter Name | Entity | Value(s) | Description |
| ---------------|--------|----------|-------------|
| trigger | @sys.number-integer | recommended -10 through 10 | This is the basis of the temperament system. **A negative number removes temperament, a positive number increases temperament.** Temperament by default starts at value 10, you lose when it reaches 0 and win when it reaches value 20. Use that as reference. |
| reset | @sys.any | r | Use this parameter only if you want the trigger to reset the game. This is optional |
| reset | @sys.number-integer | Any positive number. Recommended ceiling of 100 | This sets the winning target for the game. I don't recommend using this feature. It will reset the game, and you will start with 1/2 of whatever value you entered, in Temperament. The game functions the same way. |

I highly recommend not using the reset parameter, but its your choice.

# Advanced

If you are an advanced user, you can fork this repo and edit the config.json. This provides advanced customization options for your AI. You can then proceed and use the github repo with Heroku, and then just follow the rest of the directions as normal.
