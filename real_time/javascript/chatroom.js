var chatrooom = new function () {
    let component = this;
    let socket;

    //type 0:text 1:image_file 2:text_file
    let current_file = {
        name: '',
        type: 0,
        size: ''
    }

    if (!window.WebSocket) {
        window.WebSocket = window.MozWebSocket;
    }

    component.socketinit = () => {
        if (window.WebSocket) {
            socket = new WebSocket(websocket_api + user.name + '/' + user.current_room);

            socket.onmessage = function (event) {
                let res_message = JSON.parse(event.data);
                console.log(res_message)
                if (res_message.type == 0) {
                    component.text_template(res_message.sender,res_message.msg);
                    return;
                }
                else if(res_message.type == -1){
                    addnotify('websocket send fail');
                    return;
                }
                component.file_template(res_message.msg,res_message.type);

            };
            socket.onopen = function (event) {
                addnotify('connect open!!');
            };
            socket.onclose = function (event) {
                addnotify('connect close!!');
                component.socket_reconnect();
            };

        } else {
            alert("你的瀏覽器不支援 WebSocket！");
        }
    }

    component.socket_reconnect = () => {
        console.log("socket 連線斷開,正在嘗試重新建立連線");
        component.socketinit();
    }

    component.send = (message, trans_type) => {
        if (!window.WebSocket||!message.trim()) {
            return;
        }
        if (socket.readyState == WebSocket.OPEN) {
            socket.send(JSON.stringify({
                msg: message,
                type: trans_type
            }));
            
        } else {
            alert("連線沒有開啟.");
        }
    }

    component.sendfile = async () => {
        const file = current_file.file;
        let form = new FormData();
        form.append("file", file)
        let result = await fetch(api + 'upload', { method: 'POST', body: form });
        result = result.json();
        if (result.datatype == 0) {
            addnotify('upload fail,please try again');
            return;
        }
        component.send(current_file.name, current_file.type);
    }

    component.file_check = (file) => {
        console.log('into check');
        if(file.type.indexOf('image') > -1){
            return true;
        }
        else if (file.type.split('/')[1] == 'plain'){
            return true;
        }
        else if ((file.size / 1024 / 1024).toFixed(2) > 2) {
            addnotify('File can not over 2MB');
            return false;
        }
        addnotify('Just accept image and text file!!');
        return false;

    }

    component.file_template = (file_name, file_type) => {
        let addimg;
        switch (file_type) {
            case 1:
                addimg = `<a href = ${download_url + file_name}><img src = ${fileurl + file_name}></a><br>`
                break;
            case 2:
                addimg = `<a href = ${download_url + file_name}><img src = ${fileurl}document.png></a><br>`
                break;
            default:
                console.log('wrong file type');
        }
        $('#chatarea').append(addimg);

    }

    component.text_template = (sender,data) => {
        let text = `${sender}:<span class = 'badge badge-pill badge-primary'>${data}</span><br>`
        $("#chatarea").append(text);
    }

    component.RegisterListenEvent = () => {

        $("#send_text").on('click', async(event) => {
            if(current_file.name == ''){
                component.send($("#message").val(), 0);
                $("#message").val('');
                return;
            }
            await component.sendfile();
            current_file.name = '';
        });

        $("#file-input").on('change', (event) => {
            const file = event.target.files[0];
            if(!component.file_check(file)) return;
            
            current_file.name = file.name;
            current_file.size = file.size;
            current_file.file = file;

            if (file.type.indexOf('image') > -1) {
                current_file.type = 1;
            }
            else if (file.type.indexOf('text') > -1) {
                current_file.type = 2;
            }
        });

        $("#notify").on('click',removenotify);

        $("#send_file").on('click', () => {
            $('#file-input').trigger('click');
        });

        $( document ).ready(() => {
            $("#topic").text(user.current_room);
        });

        
        $("#message").on('keypress',async function(e) {
            if(e.which == 13) {
                $("#send_text").trigger('click');
            }
        });

    }


};

(function () {
    chatrooom.socketinit();
    chatrooom.RegisterListenEvent();
})();