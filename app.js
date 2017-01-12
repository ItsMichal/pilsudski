const apiaibotkit = require('api-ai-botkit');
const apiai = apiaibotkit(3338480a082e4f9fb41267b47f303f66);

var madness = 10;

apiai
    .action('smalltalk.greetings', function (message, resp, bot) {
        var responseText = resp.result.fulfillment.speech;
        bot.reply(message, responseText);
    })
    .action('input.unknown', function (message, resp, bot) {
        bot.reply(message, "Sorry, I don't understand");
    })
    .action('test.action', function(message, resp, bot){
        bot.reply(messahe, "20XX");
    })
    ;
