// include the node twilio helper library
var twilio = require('twilio');

// define how many channels you want to be available
var channelCount = 4;



var speakerCount = 0;

var channels = [];

var sounds = {
  enter:{
    channel: 0,
    mp3: "http://astleystems.s3.amazonaws.com/backing.mp3"
  },
  q: {
    channel:1,
    mp3: "http://astleystems.s3.amazonaws.com/v1.mp3"
  },
  w: {
    channel:2,
    mp3: "http://astleystems.s3.amazonaws.com/v2.mp3"
  },
  e: {
    channel:3,
    mp3: "http://astleystems.s3.amazonaws.com/v3.mp3"
  },
  r: {
    channel:1,
    mp3: "http://astleystems.s3.amazonaws.com/v4.mp3"
  },
  t: {
    channel:2,
    mp3: "http://astleystems.s3.amazonaws.com/v5.mp3"
  },
  y: {
    channel:3,
    mp3: "http://astleystems.s3.amazonaws.com/v6.mp3"
  },
  u: {
    channel:1,
    mp3: "http://astleystems.s3.amazonaws.com/v7.mp3"
  },
  i: {
    channel:2,
    mp3: "http://astleystems.s3.amazonaws.com/v8.mp3"
  },
  o: {
    channel:3,
    mp3: "http://astleystems.s3.amazonaws.com/v9.mp3"
  },
  p: {
    channel:1,
    mp3: "http://astleystems.s3.amazonaws.com/v10.mp3"
  },
  a: {
    channel:2,
    mp3: "http://astleystems.s3.amazonaws.com/v11.mp3"
  },
  s: {
    channel:3,
    mp3: "http://astleystems.s3.amazonaws.com/v12.mp3"
  },
  d: {
    channel:1,
    mp3: "http://astleystems.s3.amazonaws.com/v13.mp3"
  },
  f: {
    channel:2,
    mp3: "http://astleystems.s3.amazonaws.com/v14.mp3"
  },
  g: {
    channel:3,
    mp3: "http://astleystems.s3.amazonaws.com/v15.mp3"
  },
  h: {
    channel:1,
    mp3: "http://astleystems.s3.amazonaws.com/v16.mp3"
  },
  j: {
    channel:2,
    mp3: "http://astleystems.s3.amazonaws.com/v17.mp3"
  },

}




var createSpeaker = function() {
  var channel = speakerCount % channelCount;
  var speaker = new Speaker(speakerCount, channel);
  channels[channel].addSpeaker(speaker);
  speakerCount++;
  return speaker;
}

var findSpeaker = function(name) {

  var channel = channels[name%channelCount];
  return channel.findSpeaker(name);
}

var Channel = function() {
  var speakers = {};

  this.findSpeaker = function(name) {
    return speakers[name+""];
  }

  this.addSpeaker = function(speaker) {
    speakers[speaker.name] = speaker;
  }

  this.playSound = function(mp3){
    for (var i in speakers) {
      speakers[i].playSound(mp3);
    }
  }
  return this;
}

var Speaker = function(name, channel) {
  var status = false;
  this.name = name;
  this.channel = channel;

  this.playSound = function(mp3) {
    status = mp3;
  }

  this.response = function(resp) {
    if (status) {
      resp.play(status);
      status = false;
    }
    resp.redirect("/status?name="+name);
    return resp;
  }

  return this;
}

for (var i = 0; i < channelCount; i++) {
  channels.push(new Channel());
}


/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});


function playNote(channel, mp3) {
  channels[channel].playSound(mp3);
}

// Routes


io.sockets.on('connection', function (socket) {
  socket.emit("setup", {
    channelCount: channelCount,
    sounds: sounds
  })
  socket.on('keypress', function (data) {
    var sound = sounds[data];
    if (sound) {
      io.sockets.emit('sound',sound);
      playNote(sound.channel,sound.mp3);
    }
  });
});

app.get('/', routes.index);

app.post("/call", function(req, res) {
  var speaker = createSpeaker();
  if (!req.body.From) req.body.From = "+447515354472";
  io.sockets.emit('call',{speaker:speaker, body:req.body.From});
  var twiml = new twilio.TwimlResponse();
  twiml.say("please wait");
  res.send(speaker.response(twiml).toString());
});

app.post("/status", function(req, res) {
  var speaker = findSpeaker(req.query.name);
  var twiml = new twilio.TwimlResponse();
  res.send(speaker.response(twiml).toString());
});

app.listen(1338);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
