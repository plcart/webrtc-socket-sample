# webrtc-socket-sample
Sample Socket.io project to support WebRTC applications

## Setup

      npm build && npm start

## Usage Overview

*Client | Server*

    client.emit('join', USERNAME);            // register as available peer
    client.on('whoami', id => { });           // receive your id
    client.on('online', users => { });        // receive who is online
    client.emit('call', ANOTHER_USER_ID);     // Attempt to make a call
    client.on('created', roomId => { });      // receive room unique id
    client.on('ready', () => { });            // ready to start the call
    client.on('incoming', roomInfo => { });   // Attempt to receive a call
    client.emit('call-answered', ROOM_ID);    // Accept the incoming call
    client.emit('call-rejected', ROOM_ID);    // Reject the incoming call
    client.on('rejected', () => { });         // Call rejected
    client.on('not-available', () => { });    // User in another call
    client.emit('bye');                       // Leave Current room
    
    client.emit('rtcmessage', IceCandidate | Offer | Anwser);
    client.on('rtcmessage', (message: IceCandidate | Offer | Anwser) => { });

## Client Examples

[WebRTCShim](https://github.com/plcart/webrtc-shim)
