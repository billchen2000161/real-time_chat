var init_msg = () => {
    message_format.type = 0;
    message_format.room = '';
    message_format.msg = '';
    file = '';
}

var loadpage = (url, target) => {
    fetch(url)
        .then((response) => response.text())
        .then((res) => {
            $("#" + target).html(res);
        })
        .catch((error) => {
            console.warn(error);
        });
}

var httpfordata = (url, data, method, callback) => {
    fetch(url, {
        body: JSON.stringify(data),
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'user-agent': 'Mozilla/4.0 MDN Example',
            'content-type': 'application/json'
        },
        method: method,
        mode: 'cors',
    })
        .then((res) => {
            return res.json();
        })
        .then(result => {
            callback(result);
        })
        .catch(err => {
            console.log(err);
        })
}

var addnotify = (content) => {
    const notify = '<div class = "alert alert-warning role = "alert">' + content + '<span class="float-right">x</span></div>'
    $("#notify").html(notify);
}

var removenotify = () => {
    $("#notify").html('');
}