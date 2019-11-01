var express = require('express');
var http = require('http');
var io = require('socket.io');
var joystick = require("node-sense-hat").Joystick.getJoystick();

var app = express();

var image_sense = require("sense-hat-led");

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
server.listen(80, function () {
    var port = server.address().port;
    console.log('Example app listening on port ', port);
});

io = io.listen(server);

class Matrix {
    constructor(O, X) {
        this.cursor = {
            x: 0,
            y: 0
        };
        this.on = O;
        this.off = X;
        this.resetMatrix();
    }

    resetMatrix() {
        this.matrix = [
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off],
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off],
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off],
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off],
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off],
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off],
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off],
            [this.off, this.off, this.off, this.off, this.off, this.off, this.off, this.off]
        ];
    }

    apply() {
        let final_matrix = [];
        this.matrix.forEach((rows, index) => {
            rows.forEach((value, index) => {
                final_matrix.push(value);
            });
        });

        this.raw_matrix = final_matrix;

        image_sense.setPixels(this.raw_matrix);
    }

    finalMatrix() {
      return this.matrix;
    }

    down() {
        this.resetMatrix();

        if (this.cursor.y >= 7) {
            this.cursor.y = 7;
            return;
        }

        this.cursor.y++;

        this.applyCursor();
    }

    up() {
        this.resetMatrix();

        if (this.cursor.y <= 0) {
            this.cursor.y = 0;
            return;
        }

        this.cursor.y--;
        this.applyCursor();
    }

    right() {
        this.resetMatrix();

        if (this.cursor.x >= 7) {
            this.cursor.x = 7;
            return;
        }

        this.cursor.x++;
        this.applyCursor();
    }

    left() {
        this.resetMatrix();

        if (this.cursor.x <= 0) {
            this.cursor.x = 0;
            return;
        }

        this.cursor.x--;

        this.applyCursor();
    }

    applyCursor() {
        this.turnOn(this.cursor.x, this.cursor.y);
    }

    turnOn(row, column) {
        this.matrix[column][row] = this.on;
        this.apply();
    }
}

var O = [255, 0, 255];
var X = [255, 255, 0];

var matrix = new Matrix(O, X);
matrix.apply();


io.on('connection', function (socket) {
    socket.emit('server_connected', {
        message: "Socket connected!"
    });

    socket.on('change_color', function (data) {
        image_sense.clear(data.color_code);
    });

    joystick.then(target => {
        target.on("press", direction => {
          matrix[direction]();
          console.log("Joystick pressed in " + direction + " direction");
          socket.emit('update_matrix', {
            matrix: matrix.finalMatrix()
          });
        });
    });
});
