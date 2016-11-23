'use strict';
var http = require('http');

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

function startTalking(session, callback, intent, backoff) {
    getJson(
        session,
        intent,
        0,
        function(results) {
            session.results = results;
            var resultText = '';
            for (var i = 0, len = results.length; i < len - 1; i++) {
                resultText += results[i].text + ' ... ... ';
            }
            const sessionAttributes = session.attributes;
            const cardTitle = 'WeFeelFine';
            const speechOutput = resultText + ' ... Shall I continue?';
            const repromptText = 'Shall I continue?';
            const shouldEndSession = false;
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }
    );
}

function startHelp(callback) {
    const sessionAttributes = {};
    const cardTitle = 'WeFeelFine';
    const speechOutput = "How are others feeling? Ask how women are feeling in Japan. How do people feel in rainy weather. What are happy people saying.";
    const repromptText = "I can filter by feelings, gender, locations and even weather.";
    const shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function shutUp(session, callback) {
    const sessionAttributes = session.attributes;
    const cardTitle = 'WeFeelFine';
    const speechOutput = "";
    const shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'WeFeelFine';
    const speechOutput = "";
    const shouldEndSession = true;
    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    const sessionAttributes = {};
    const cardTitle = 'WeFeelFine';
    const speechOutput = "Welcome to we feel fine. Ask how people are feeling to get started.";
    const repromptText = "Or ask for help to hear more options,";
    const shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    if (!session.attributes) {
        session.attributes = {};
    }

    if (intentName === 'HowDoWeFeelIntent') {
        startTalking(session, callback, intent);
    } else if (intentName === 'AMAZON.YesIntent') {
        startTalking(session, callback, intent);
    } else if (intentName === 'AMAZON.HelpIntent') {
        startHelp(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent' || intentName === 'AMAZON.NoIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}

function getDate() {
    var start = new Date(2005, 11, 31);
    var end = new Date(2014, 7, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getURL(intent, backoff) {
    var date = getDate();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    
    var url = "http://api.wefeelfine.org:8080/ShowFeelings";
    url += "?display=text&returnfields=sentence,postdate,imageid&limit=10";
    if (!backoff) {
        url += "&postdate="+year+"-";
        if (month < 10) {
            url += "0";
        }
        url += month+"-";
        if (day < 10) {
            url += "0";
        }
        url += day;
    }
    else if (backoff == 1) {
        url += "&postmonth="+month+"&postyear="+year;
    }
    else if (backoff == 2) {
        url += "&postyear="+year;
    }
    
    if (intent.slots) {
        if (intent.slots.gender && intent.slots.gender.value) {
            if (['male', 'man', 'men', 'boys', 'guys', 'dudes'].indexOf(intent.slots.gender.value) !== -1) {
                url += "&gender=1";
            }
            else if (['female', 'woman', 'women', 'girls', 'gals', 'chicks'].indexOf(intent.slots.gender.value) !== -1) {
                url += "&gender=0";
            }
        }
        if (intent.slots.feeling && intent.slots.feeling.value) {
            url += "&feeling="+intent.slots.feeling.value;
        }
        if (intent.slots.age && intent.slots.age.value) {
            if (intent.slots.age.value >= 0 && intent.slots.age.value < 10) {
                url += "&agerange=0";
            }
            else if (intent.slots.age.value >= 10 && intent.slots.age.value < 20) {
                url += "&agerange=10";
            }
            else if (intent.slots.age.value >= 20 && intent.slots.age.value < 30) {
                url += "&agerange=20";
            }
            else if (intent.slots.age.value >= 30 && intent.slots.age.value < 40) {
                url += "&agerange=30";
            }
            else if (intent.slots.age.value >= 40 && intent.slots.age.value < 50) {
                url += "&agerange=40";
            }
            else if (intent.slots.age.value >= 50 && intent.slots.age.value < 60) {
                url += "&agerange=50";
            }
            else if (intent.slots.age.value >= 60 && intent.slots.age.value < 70) {
                url += "&agerange=60";
            }
            else if (intent.slots.age.value >= 70 && intent.slots.age.value < 80) {
                url += "&agerange=70";
            }
            else if (intent.slots.age.value >= 80 && intent.slots.age.value < 90) {
                url += "&agerange=80";
            }
            else if (intent.slots.age.value >= 90 && intent.slots.age.value < 100) {
                url += "&agerange=90";
            }
        }
        if (intent.slots.condition && intent.slots.condition.value) {
            if (intent.slots.condition.value == "sunny") {
                url += "&conditions=1";
            }
            else if (intent.slots.condition.value == "rainy") {
                url += "&conditions=2";
            }
            else if (intent.slots.condition.value == "snowy") {
                url += "&conditions=3";
            }
            else if (intent.slots.condition.value == "cloudy") {
                url += "&conditions=4";
            }
        }
        if (intent.slots.country && intent.slots.country.value) {
            url += "&country="+intent.slots.country.value;
        }
        if (intent.slots.state && intent.slots.state.value) {
            url += "&state="+intent.slots.state.value;
        }
        if (intent.slots.city && intent.slots.city.value) {
            url += "&city="+intent.slots.city.value;
        }
    }
    return url;
}

function getJson(session, intent, backoff, eventCallback) {
    if (!backoff) {
        backoff = 0;
    }
    if (backoff > 3) {
        return eventCallback([{text:"I was unable to find any feelings with these filters. I'm sorry."}]);
    }
    var url = getURL(intent, backoff);
    console.log(url);
    
    http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            //console.log(body);
            if (body === '') {
                backoff++;
                console.log('backoff : '+backoff);
                getJson(session, intent, backoff, eventCallback);
            }
            else {
                var results = body.split("\t<br>\r");
                var resultJson = [];
                for (var i = 0, len = results.length; i < len - 1; i++) {
                    var result = results[i];
                    var splitResult = result.split(/\t/);
                    var json = {};
                    if (splitResult.length === 3) {
                        json.image = splitResult.pop();
                    }
                    json.date = splitResult.pop();
                    json.text = splitResult.pop();
                    resultJson.push(json);
                }
                eventCallback(resultJson);
            }
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        if (event.session.application.applicationId !== 'amzn1.ask.skill.f41ca782-bb65-409d-99d4-6b83bf714afa') {
             callback('Invalid Application ID');
        }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};
