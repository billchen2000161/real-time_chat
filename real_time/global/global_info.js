var api = 'http://127.0.0.1:3000/';
var websocket_api = "ws://localhost:8080/";

var user = {
    account: '',
    name: '',
    current_room: ''
}

var message_format = {
    //0:text,1:file
    type: 0,
    room: '',
    msg: ''
}