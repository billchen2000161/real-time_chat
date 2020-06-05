class Chat {
    constructor({ calledHandle, host, socketPath, getCallReject } = {}) {
        this.host = host
        this.socketPath = socketPath
        this.socket = null
        this.calledHandle = calledHandle
        this.getCallReject = getCallReject
        this.peer = null
        this.localMedia = null
    }
    async init() {
        this.socket = await this.connentSocket()
        return this
    }
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
    }
    addEvent(name, cb) {
        if (!this.socket) return
        this.socket.on(name, (data) => {
            cb.call(this, data)
        })
    }
    sendMessage(name, data) {
        if (!this.socket) return
        this.socket.emit(name, data)
    }
    // 獲取本地媒體流
    async  getLocalMedia() {
        let localMedia = await navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user", width: 700, height:500 }, audio: true })
            .catch(e => {
                console.log(e)
            })
        this.localMedia = localMedia
        return this
    }
    // 設置媒體流到video
    setMediaTo(eleId, media) {
        document.getElementById(eleId).srcObject = media
    }
    // 被叫響應
    called(callingInfo) {
        this.calledHandle && this.calledHandle(callingInfo)
    }
    // 創建RTC
    createLoacalPeer() {
        const configuration = {
            iceServers: [{
                urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
            }]
        };
        this.peer = new RTCPeerConnection(configuration)
        return this
    }
    // 將媒體流加入通信
    addTrack() {
        if (!this.peer || !this.localMedia) return
        //this.localMedia.getTracks().forEach(track => this.peer.addTrack(track, this.localMedia));
        this.peer.addStream(this.localMedia)
        return this
    }
    // 創建 SDP offer
    async createOffer(cb) {
        if (!this.peer) return
        let offer = await this.peer.createOffer({ OfferToReceiveAudio: true, OfferToReceiveVideo: true })
        this.peer.setLocalDescription(offer)
        cb && cb(offer)
        return this
    }
    async createAnswer(offer, cb) {
        if (!this.peer) return
        this.peer.setRemoteDescription(offer)
        let answer = await this.peer.createAnswer({ OfferToReceiveAudio: true, OfferToReceiveVideo: true })
        this.peer.setLocalDescription(answer)
        cb && cb(answer)
        return this
    }
    listenerAddStream(cb) {
        this.peer.addEventListener('addstream', event => {
            console.log('addstream事件觸發', event.stream);
            cb && cb(event.stream);
        })
        return this
    }
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
    }
    // 檢測ice協商過程
    listenerGatheringstatechange() {
        this.peer.addEventListener('icegatheringstatechange', e => {
            console.log('ice協商中: ', e.target.iceGatheringState);
        })
        return this
    }
    // 關閉RTC
    closeRTC() {
        // ....
    }
}
