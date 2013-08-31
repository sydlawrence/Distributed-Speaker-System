var Speaker = function(name, channel) {
  var status = false;
  this.name = name;
  this.channel = channel;

  this.playSound = function(mp3) {
    status = mp3;
  }

  this.response = function() {
    var response = "";
    if (status) {
      response += "<Play>"+status+"</Play>";
      status = false;
    }
    response += "<Redirect>/status?name="+name+"</Redirect>";

    return response;
  }

  this.render = function() {
    var rendered = $("<div class='speaker'/>");
    rendered.data("name", name);
    console.log(rendered);
    return rendered;
  }

  return this;
}