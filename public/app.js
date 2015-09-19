// public/app.js
var Channel = {
    socket: io(),
    
    getReady: function(){
        Channel.socket.on('join', Channel.onJoin);
        Channel.socket.on('ready', Channel.onReady);
        Channel.socket.on('full', Channel.onFull);
        Channel.socket.emit('join', 'room');
    },
    establishConnection: function(){
        console.log('connect button pressed!');
    },
    sendData: function(){
        console.log('send data button pressed!');
    },

    onJoin: function(){
        console.log('server says we have joined!');        
    },
    onReady: function(){
         console.log('server says it is ready!');
    },
    onFull: function(){
        console.log('boo :( room is full');
    }
    
};
Channel.readyButton = document.getElementById('ready');
Channel.readyButton.addEventListener('click', Channel.getReady, false);

Channel.connectButton = document.getElementById('connect');
Channel.connectButton.addEventListener('click', Channel.establishConnection, false);

Channel.sendButton = document.getElementById('send-data');
Channel.sendButton.addEventListener('click', Channel.sendData, false);

