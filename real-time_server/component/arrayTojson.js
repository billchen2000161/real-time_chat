let arraytojson = (data) => {
    let result = {}
    data.forEach(element => {
        for(let index in element){
            result[element[index]] = element[index];
        }
    });
    return result;
}

module.exports = {
    arraytojson
}