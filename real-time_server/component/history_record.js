let repository = require('../DB/repository');
let arraytojson = require('./arrayTojson');

let history_record = async (req, res) => {
    let search_room = req.body.room;
    let result = await repository.querySql('select * from chat_record where room = @room order by CONVERT(datetime, recordtime )', { room: search_room });

    res.json(result.recordset);
}

module.exports = history_record;