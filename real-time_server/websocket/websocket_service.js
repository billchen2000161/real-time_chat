let db = require('../DB/repository');
let moment = require('moment');

let save_message = (username, room, message, type) => {
    let date = moment(Date.now()).format('YYYY-MM-DDTHH:mm:ss.SSS');
    try {
        db.add({
            username: username,
            message: message,
            recordtime: date,
            room: room,
            type: type
        }, 'chat_record');
    } catch (err) {
        console.log('DB save fail');
    }
}

module.exports = {
    save_message
} 