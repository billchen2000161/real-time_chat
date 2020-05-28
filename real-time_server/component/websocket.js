const WebSocket = require('ws');
const fs = require('fs');
const server = new WebSocket.Server({ port: 8080 });

server.on('open', function open() {
    console.log('connected');
});

server.on('close', function close() {
    console.log('disconnected');
});

server.on('error', () => {
    console.log('this on error');
})

server.on('connection', function connection(ws, req) {
    //get user name
    const url = req.url.split('/');
    if (url.length > 3) {
        return;
    }
    ws.id = url[1];
    ws.room = url[2];

    ws.on('message', function incoming(message) {
        let msg = JSON.parse(message);
        console.log(ws.id+' : from '+ws.room);

        // send msg to client that in the same room 
        server.clients.forEach(function each(client) {
            if (client.room == ws.room) {
                client.send(message);
            }
        });

    });

});