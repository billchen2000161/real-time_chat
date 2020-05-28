let db = require('./repository');
let arraytojson = require('./arrayTojson')
let roomlist = async () => {
    let result = await db.querySql('select Room from chatroom');
    let result_json = arraytojson.arraytojson(result.recordset);
    return result_json;
}

module.exports = {
    roomlist
}