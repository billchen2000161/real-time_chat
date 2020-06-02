let db = require('../DB/repository');
let roomlist = async () => {
    let result = await db.querySql('select Room from chatroom');
    return result.recordset;
}

module.exports = {
    roomlist
}