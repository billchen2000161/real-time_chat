var nChat = {
    host: '',
    socketPath: '',
    socket: '',
    calledHandle: '',
    getCallReject: '',
    peer: '',
    localMedia: '',

    async init() {
        this.socket = await this.connentSocket()
        return this
    },
    async connentSocket() {
        if (this.socket) return this.socket
        return new Promise((resolve, reject) => {
            let socket = io(this.host, { path: this.socketPath })
            socket.on("connect", () => {
                console.log("連接成功！")
                resolve(socket)
            })
            socket.on("connect_error", e => {
                console.log("連接失敗！")
                throw e
                reject()
            })
            // 呼叫被接受
            socket.on('answer', ({ answer }) => {
                this.peer && this.peer.setRemoteDescription(answer)
            })
            // 被呼叫事件
            socket.on('called', callingInfo => {
                this.called && this.called(callingInfo)
            })
            // 呼叫被拒
            socket.on('callRejected', () => {
                this.getCallReject && this.getCallReject()
            })
            socket.on('iceCandidate', ({ iceCandidate }) => {
                console.log('遠端添加iceCandidate');
                this.peer && this.peer.addIceCandidate(new RTCIceCandidate(iceCandidate))
            })
        })
    },
    addEvent(name, cb) {
        if (!this.socket) return
        this.socket.on(name, (data) => {
            cb.call(this, data)
        })
    },
    sendMessage(name, data) {
        if (!this.socket) return
        this.socket.emit(name, data)
    },
    // 獲取本地媒體流
    async  getLocalMedia() {
        let localMedia = await navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user", width: 700, height: 500 }, audio: true })
            .catch(e => {
                console.log(e)
            })
        this.localMedia = localMedia
        return this
    },
    // 設置媒體流到video
    setMediaTo(eleId, media) {
        document.getElementById(eleId).srcObject = media
    },
    // 被叫響應
    called(callingInfo) {
        this.calledHandle && this.calledHandle(callingInfo)
    },
    // 創建RTC
    createLoacalPeer() {
        const configuration = {
            iceServers: [{
                urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
            }]
        };
        this.peer = new RTCPeerConnection(configuration)
        return this
    },
    // 將媒體流加入通信
    addTrack() {
        if (!this.peer || !this.localMedia) return
        //this.localMedia.getTracks().forEach(track => this.peer.addTrack(track, this.localMedia));
        this.peer.addStream(this.localMedia)
        return this
    },
    // 創建 SDP offer
    async createOffer(cb) {
        if (!this.peer) return
        let offer = await this.peer.createOffer({ OfferToReceiveAudio: true, OfferToReceiveVideo: true })
        this.peer.setLocalDescription(offer)
        cb && cb(offer)
        return this
    },
    async createAnswer(offer, cb) {
        if (!this.peer) return
        this.peer.setRemoteDescription(offer)
        let answer = await this.peer.createAnswer({ OfferToReceiveAudio: true, OfferToReceiveVideo: true })
        this.peer.setLocalDescription(answer)
        cb && cb(answer)
        return this
    },
    listenerAddStream(cb) {
        this.peer.addEventListener('addstream', event => {
            console.log('addstream事件觸發', event.stream);
            cb && cb(event.stream);
        })
        return this
    },
    // 監聽候選加入
    listenerCandidateAdd(cb) {
        this.peer.addEventListener('icecandidate', event => {
            let iceCandidate = event.candidate;
            if (iceCandidate) {
                console.log('發送candidate給遠端');
                cb && cb(iceCandidate);
            }
        })
        return this
    },
    // 檢測ice協商過程
    listenerGatheringstatechange() {
        this.peer.addEventListener('icegatheringstatechange', e => {
            console.log('ice協商中: ', e.target.iceGatheringState);
        })
        return this
    },
    // 關閉RTC
    closeRTC() {
        // ....
    }
}

$(function () {
    // let chat = new Chat({
    //     host: 'http://127.0.0.1:3000',
    //     socketPath: "/video",
    //     calledHandle: calledHandle,
    //     getCallReject: getCallReject
    // })

    let chat = nChat;
    chat.host = 'http://127.0.0.1:3000';
    chat.socketPath = '/video';
    chat.calledHandle = calledHandle;
    chat.getCallReject = getCallReject;

    async function init() {
        await chat.init()
        chat.addEvent('updateUserList', updateUserList)
        chat.addEvent(user.current_room, updateMessageList);
        chat.sendMessage('addUser', { name: user.name, room: user.current_room })
    }

    init();

    // 更新用戶列表視圖
    function updateUserList(list) {
        $(".user-list").html(list.reduce((temp, li) => {
            temp += `<li class="user-li">${li.name} <button data-calling=${li.calling} data-id=${li.id} class=${li.id === this.socket.id || li.calling ? 'cannot-call' : 'can-call'}> 通話</button></li>`
            return temp
        }, ''))
    }

    // 更新消息li表視圖
    function updateMessageList(msg) {
        // $('.message-list').append(`<li class=${msg.userId === this.socket.id ? 'left' : 'right'}>${msg.user}: ${msg.content}</li>`)
        text_template(msg.user, msg.content)
    }

    function text_template(sender, data) {
        let text = `${sender}:<span class = 'badge badge-pill badge-primary'>${data}</span><br>`
        $("#chatarea").append(text);
    }
    // 加入房間
    // $('.topic').on('click', async (e) => {
    //     let name = $('.myname').val()
    //     current_room = $(e.target).text();
    //     console.log('room : ', current_room);
    //     if (!name) return
    //     $('.mask').fadeOut()
    //     await chat.init()
    //     // 用戶加入事件
    //     chat.addEvent('updateUserList', updateUserList)
    //     // 消息更新事件
    //     // chat.addEvent('updateMessageList', updateMessageList)
    //     chat.addEvent(current_room, updateMessageList);
    //     chat.sendMessage('addUser', { name, current_room })
    // })
    // 發送消息
    $('#send_text').on('click', () => {
        let sendContent = $('#message').val()
        if (!sendContent) return
        $('#message').val('')
        chat.sendMessage('sendMessage', { content: sendContent, room: user.current_room })
    })
    // 視屏
    $('.user-list').on('click', '.can-call', async function () {
        // 被叫方信息
        let calledParty = $(this).data()
        if (calledParty.calling) return console.log('對方正在通話');
        // 初始本地視頻
        $('.local-video').fadeIn()
        await chat.getLocalMedia()
        chat.setMediaTo('local-video', chat.localMedia)
        chat.createLoacalPeer()
            .listenerGatheringstatechange()
            .addTrack()
            .listenerAddStream(function (stream) {
                $('.remote-video').fadeIn()
                chat.setMediaTo('remote-video', stream)
            })
            .listenerCandidateAdd(function (iceCandidate) {
                chat.sendMessage('iceCandidate', { iceCandidate, id: calledParty.id })
            })
            .createOffer(function (offer) {
                chat.sendMessage('offer', { offer, ...calledParty })
            })
    })
    //呼叫被拒絕
    function getCallReject() {
        chat.closeRTC()
        $('.local-video').fadeIn()
        console.log('呼叫被拒');
    }
    // 被叫
    async function calledHandle(callingInfo) {
        if (!confirm(`是否接受${callingInfo.name}的視頻通話`)) {
            chat.sendMessage('rejectCall', callingInfo.id)
            return
        }
        $('.local-video').fadeIn()
        await chat.getLocalMedia()
        chat.setMediaTo('local-video', chat.localMedia)
        chat.createLoacalPeer()
            .listenerGatheringstatechange()
            .addTrack()
            .listenerCandidateAdd(function (iceCandidate) {
                chat.sendMessage('iceCandidate', { iceCandidate, id: callingInfo.id })
            })
            .listenerAddStream(function (stream) {
                $('.remote-video').fadeIn()
                chat.setMediaTo('remote-video', stream)
            })
            .createAnswer(callingInfo.offer, function (answer) {
                chat.sendMessage('answer', { answer, id: callingInfo.id })
            })
    }
})