var express = require('express');
var http = require('http');
var io = require('socket.io');

var app = express();

var sense_hat = require('node-sense-hat');
matrix = sense_hat.Leds;

// Enable HTML template middleware
app.engine('html', require('ejs').renderFile);

// Enable static CSS styles
app.use(express.static('public'));

// reply to request with "Hello World!"
app.get('/', function (req, res) {
  res.render('index.html');
});

var server = http.createServer(app);

app.use(express.static(__dirname + '/static'))
server.listen(80, function() {
  var port = server.address().port;
  console.log('Example app listening on port ', port);
});

io = io.listen(server);

io.on('connection', function(socket) {
  socket.emit('server_connected', {
    "message": "Socket connected!"
  });

  socket.on('change_color', function (data) {
    let color = data.color_code;
    let rounded_color = [Math.round(color[0]), Math.round(color[1]), Math.round(color[2])];
    matrix.clear(rounded_color);
  });
});

