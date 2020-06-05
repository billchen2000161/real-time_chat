let get_chatlist = () => {
    httpfordata(api + 'chatlist', user, 'POST', chatlist);
}

let chatlist = (topic) => {
    //init chatroom 
    $('#chatlist').html('');

    //build chatlist
    topic.forEach(element => {
        let id = element.Room;
        let item = `<button class = "list-group-item btn">${id}</button>`;
        $('#chatlist').append(item);
    });
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
    // loadpage('./RTC.html', 'video');
});
