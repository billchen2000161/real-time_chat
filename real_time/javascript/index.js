let get_chatlist = () => {
    httpfordata(api + 'chatlist', user, 'POST', chatlist);
}

let chatlist = (member) => {
    //init chatroom 
    $('#chatlist').html('');

    //build chatlist
    for (let index in member) {
        let id = member[index];
        let item = "<button type='button' class='list-group-item list-group-item-action' id = " + id + ">" + id + "</button>"
        $('#chatlist').append(item);
    }
}

$("#username").on('change', (event) => {
    user.name = event.target.value;
    $("#username_space").text('your name : ' + event.target.value);
    get_chatlist();
    event.target.remove();
})

$('#chatlist').click((e) => {
    user.current_room = $(e.target).text();
    loadpage('./chatroom.html', 'chatroom');
});