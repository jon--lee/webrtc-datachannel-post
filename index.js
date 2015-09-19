var express = require('express');
var app = express();
var http =require('http').Server(app);

var socketio = require('socket.io');
var io = socketio(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html')
});

app.use(express.static(__dirname + '/public'));

port = process.env.PORT || 5000;
http.listen(port, function() {
    console.log("running on http://localhost:" + port);
});


io.on('connection', function(socket){
    socket.on('join', function(room){
        var clients = io.sockets.adapter.rooms[room];
        var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
        if (numClients == 0){
            socket.join(room);
            socket.emit('join', room);
        }
        else if (numClients == 1) {
            socket.join(room);
            socket.emit('join', room);
            socket.emit('ready', room);
            socket.broadcast.emit('ready', room);
        }
        else {
            socket.emit('full', room);
        }
    });    
});
