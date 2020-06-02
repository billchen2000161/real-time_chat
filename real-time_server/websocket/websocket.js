const WebSocket = require('ws');
const fs = require('fs');

let websocket_service = require('./websocket_service');
let db = require('../DB/repository');

var server;
let websocketinit = () => {
    server = new WebSocket.Server({ port: 8080 });
    server.on('open', function open() {
        console.log('connected');
    });

    server.on('close', function close() {
        console.log('disconnected');
    });

    server.on('error', () => {
        console.log('websocket on error');
        websocket_reconnect();
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
            let req_msg = JSON.parse(message);
            req_msg["sender"] = ws.id;
            websocket_service.save_message(ws.id, ws.room, req_msg.msg, req_msg.type);

            // send msg to client that in the same room 
            server.clients.forEach(function each(client) {
                if (client.room == ws.room) {
                    try {
                        client.send(JSON.stringify(req_msg));
                    } catch (err) {
                        client.send({ msg: 'socket message fail', type: -1 });
                    }
                }
            });

        });

    });
};

let websocket_reconnect = () => {
    console.log("socket 連線斷開,正在嘗試重新建立連線");
    websocketinit();
};
(function () {
    websocketinit();
})();

