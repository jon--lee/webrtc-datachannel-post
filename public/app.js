// public/app.js
var Channel = {
    socket: io(),
    
    getReady: function(){
        Channel.socket.on('join', Channel.onJoin);
        Channel.socket.on('ready', Channel.onReady);
        Channel.socket.on('full', Channel.onFull);
        Channel.socket.on('answer', Channel.onAnswer);
        Channel.socket.on('offer', Channel.onOffer);                
        Channel.socket.emit('join', 'room');
    },
    
    establishConnection: function(){
        Channel.handlePeerConnection();
        Channel.createOffer();
    },

    handlePeerConnection: function(){
        Channel.peerConnection = new RTCPeerConnection({
            iceServers: [{url: "stun:global.stun.twilio.com:3478?transport=udp" }]
        });
        Channel.peerConnection.onicecandidate = Channel.onIceCandidate;
        Channel.peerConnection.ondatachannel = Channel.receiveChannelCallback;
        Channel.socket.on('candidate', Channel.onCandidate);
    },
    
    sendData: function(){
        console.log('sending data to the peer')
        Channel.dataChannel.send('rtc data to be sent');
    },

    onJoin: function(){
        Channel.readyButton.setAttribute('disabled', 'disabled');        
    },
    onReady: function(){
        Channel.connectButton.removeAttribute('disabled');
    },
    onFull: function(){
        console.log('boo :( room is full');
    },

    onIceCandidate: function(event){
        if (event.candidate){
            Channel.socket.emit('candidate', JSON.stringify(event.candidate));
        }
    },
    onCandidate: function(candidate){
        rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
        Channel.peerConnection.addIceCandidate(rtcCandidate);
    },
    createOffer: function(){
        Channel.createDataChannel('label');
        console.log('data channel created, creating offer');
        Channel.peerConnection.createOffer(
            function(offer){
                Channel.peerConnection.setLocalDescription(offer);
                Channel.socket.emit('offer', JSON.stringify(offer));
            },
            function(err){
                console.log(err);
            }
        );
    },
    
    onOffer: function(offer) {
        console.log('received offer');
        Channel.handlePeerConnection();
        Channel.createAnswer(offer);
    },
    
    createAnswer: function(offer) {
        console.log('creating answer');
        var rtcOffer = new RTCSessionDescription(JSON.parse(offer));
        Channel.peerConnection.setRemoteDescription(rtcOffer);
        Channel.peerConnection.createAnswer(
            function(answer){
                Channel.peerConnection.setLocalDescription(answer);
                Channel.socket.emit('answer', JSON.stringify(answer));
            },
            function(err){
                console.log(err);
            }
        );
    },

    onAnswer: function(answer) {
        console.log('received answer');
        var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
        Channel.peerConnection.setRemoteDescription(rtcAnswer);
    },

    createDataChannel: function(label){
        console.log('creating data channel');
        Channel.dataChannel = Channel.peerConnection.createDataChannel(label, Channel.dataChannelOptions);
        Channel.dataChannel.onerror = function(err){
            console.log(err);
        }
        Channel.dataChannel.onmessage = function(event) {
            console.log('got channel message: ' + event.data);
        };

        Channel.dataChannel.onopen = function(){
            console.log('data channel opened');
            Channel.dataChannel.send("Hello World!");
            Channel.sendButton.removeAttribute('disabled');
            Channel.connectButton.setAttribute('disabled', 'disabled');
        };

        Channel.dataChannel.onclose = function(){
            console.log('channel closed');
        };

    },

    receiveChannelCallback: function(event){
        console.log('received callback');
        var receiveChannel = event.channel;
        receiveChannel.onopen = function(){
            console.log('receive channel event open');
        };
        receiveChannel.onmessage = function(event){
            console.log('receive channel event: ' + event.data);
        };
    }
    
};
Channel.readyButton = document.getElementById('ready');
Channel.readyButton.addEventListener('click', Channel.getReady, false);

Channel.connectButton = document.getElementById('connect');
Channel.connectButton.addEventListener('click', Channel.establishConnection, false);

Channel.sendButton = document.getElementById('send-data');
Channel.sendButton.addEventListener('click', Channel.sendData, false);

