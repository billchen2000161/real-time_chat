const SocketIO = require('socket.io')
const socketIO = new SocketIO({
    path: '/video'
})
let userRoom = {
    list: [],
    add(user) {
        this.list.push(user)
        return this
    },
    del(id) {
        this.list = this.list.filter(u => u.id !== id)
        return this
    },
    sendAllUser(name, data) {
        this.list.forEach(({ id }) => {
            console.log('>>>>>', id + ' to: ' + name)
            socketIO.to(id).emit(name, data)
        })
        return this
    },
    sendTo(id) {
        return (eventName, data) => {
            socketIO.to(id).emit(eventName, data)
        }
    },
    findName(id) {
        return this.list.find(u => u.id === id).name
    },
    findRoom(id){
        return this.list.find(u => u.id === id).room
    }
}
socketIO.on('connection', function (socket) {
    console.log('連接加入.', socket.id)
    socket.on('addUser', function (data) {
        console.log(data.name, '加入房間')
        let user = {
            id: socket.id,
            name: data.name,
            calling: false,
            room: data.room
        }
        userRoom.add(user).sendAllUser('updateUserList', userRoom.list.filter(u => u.room == data.room))
        // console.log(userRoom.list.filter(u => u.room == data.room));
    })

    socket.on('sendMessage', ({ content , room }) => {
        console.log('轉發消息：', content , 'room: ' , room)
        userRoom.sendAllUser(room, { userId: socket.id, content, user: userRoom.findName(socket.id) })
    })

    socket.on('iceCandidate', ({ id, iceCandidate }) => {
        console.log('轉發信道')
        userRoom.sendTo(id)('iceCandidate', { iceCandidate, id: socket.id })
    })
    socket.on('offer', ({ id, offer }) => {
        console.log('轉發offer')
        userRoom.sendTo(id)('called', { offer, id: socket.id, name: userRoom.findName(socket.id) })
    })
    socket.on('answer', ({ id, answer }) => {
        console.log('接受視頻');
        userRoom.sendTo(id)('answer', { answer })
    })
    socket.on('rejectCall', id => {
        console.log('轉發拒接視頻')
        userRoom.sendTo(id)('callRejected')
    })
    socket.on('disconnect', () => {
        // 斷開刪除
        console.log('連接斷開', socket.id)
        let room = userRoom.findRoom(socket.id);
        userRoom.del(socket.id).sendAllUser('updateUserList', userRoom.list.filter(u => u.room == room))
    })
})
module.exports = socketIO
