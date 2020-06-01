const WebSocket = require('ws');
const fs = require('fs');

let moment = require('moment');
let db = require('./repository');

const server = new WebSocket.Server({ port: 8080 });

server.on('open', function open() {
    console.log('connected');
});

server.on('close', function close() {
    console.log('disconnected');
});

server.on('error', () => {
    console.log('websocket on error');
});

server.on('connection', function connection(ws, req) {
    //get user name
    const url = req.url.split('/');
    if (url.length > 3) {
        return;
    }
    ws.id = url[1];
    ws.room = url[2];

    ws.on('message', function incoming(message) {
        let date = moment(Date.now()).format('YYYY-MM-DDTHH:mm:ss.SSS');
        let req_msg = JSON.parse(message);
        try{
            db.add({
                username:ws.id,
                message:req_msg.msg,
                recordtime:date,
                room:ws.room
            },'chat_record');
        }catch(err){
            console.log('DB save fail');
        }
 

        // send msg to client that in the same room 
        server.clients.forEach(function each(client) {
            if (client.room == ws.room) {
                client.send(message);
            }
        });

    });

});