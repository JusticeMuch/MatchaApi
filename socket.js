// server
const {authenticateSocketToken} = require('./middleware/verifyToken');
var invert = require('lodash.invert');

let connections  = {}

const addConnection = async (socket) => {
    userId = (await authenticateSocketToken(socket.handshake.query.token))._id;
    connections[userId] = socket.id;
    console.log('User '+ userId +' added with socketId :' + connections[userId]);
}

const getUser = async (socketId) => {
    return invert(connections)[socketId];
}

const getSocket = async (userId) => {
    return connections[userId];
}

module.exports.emitNotification = async (userId, notification) => {
    if (userId && notification){
        await io.to(await getSocket(userId)).emit('notification', notification);
    }
}

module.exports.emitMessage = async (matchId, message) => {
    if (matchId && message){
        await io.to(matchId).emit('message', message);
    }
}

module.exports.createMessage = (author, message) => {
    if (author && message)
        return {author :author, message : message}
    else{
        console.log('Error : message contents empty');
        return Error ('Message contents empty');
    }
}

module.exports.createNotification = (type, sender, receiver, content) => { //like , visit, block
    if (type && sender && receiver)
        return {type : type, sender : sender , receiver : receiver , content : content}
    else{
        console.log('Error : notification contents empty');
        return Error ('Notification contents empty');
    }
}

module.exports.socketConnect = async () =>{
    io.on("connection", async socket => {  
        await addConnection(socket);
        // notifications like
        setTimeout(()=> {
            this.emitMessage(4, this.createMessage(2, "I am working man"))
        }, 10000);
        // join room
        socket.on('joinChatroom', async (matchId) => {
            if (matchId && matchId !== undefined)
                socket.join(matchId);
            console.log(`User ${await getUser(socket.id)} joined room ${matchId}`);
        });


        socket.on('disconnect', async () => {
            console.log('user disconnected');
            socket.removeAllListeners();
            delete connections[await getUser(socket.id)];
        })
    });
}