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

  this.render = function() {
    var div = $("<div class='channel'/>");
    return div;
  }

  return this;
}