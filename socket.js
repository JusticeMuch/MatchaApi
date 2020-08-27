// server
const {authenticateSocketToken} = require('./middleware/verifyToken');
var invert = require('lodash.invert');
const { ElasticTranscoder } = require('aws-sdk');

let connections = {}

const addConnection = async (socket) => {
    userId = (await authenticateSocketToken(socket.handshake.query.token))._id;
    if (userId && userId != undefined){
        connections[userId] = socket.id;
        console.log('User ' + userId + ' added with socketId :' + connections[userId]);
    }else
        console.log('Error : User Id not in socket');
    
}

const getUser = async (socketId) => {
    return invert(connections)[socketId];
}

const getSocket = async (userId) => {
    return connections[userId];
}

module.exports.emitNotification = async (userId, notification) => {
    if (userId && notification) {
        await io.to(await getSocket(userId)).emit('notification', notification);
    }
}

module.exports.emitMessage = async (matchId, message) => {
    if (matchId && message) {
        message.matchId = matchId;
        await io.to(matchId).broadcast.emit('message', message);
    }
}

module.exports.createMessage = (author, message, date) => {
    if (author && message && date) 
        return {author: author, content: message, date : date}
     else {
        console.log('Error : message contents empty');
        return Error('Message contents empty');
    }
}

module.exports.checkUserOnline = async (user) =>{
    if (user){
        let result = await getSocket(user);

        if (result && result != undefined)
            return true;
        else
            return false;
    }else
    
        return false;
}

module.exports.createNotification = (type, sender, receiver, content) => { // like , visit, block
    if (type && sender && receiver) 
        return {type: type, sender: sender, receiver: receiver, content: content}
     else {
        console.log('Error : notification contents empty');
        return Error('Notification contents empty');
    }
}

module.exports.socketConnect = async () => {
    io.on("connection", async socket => {
        await addConnection(socket);

        socket.on('joinChatroom', async (matchId) => {
            if (matchId && matchId !== undefined) 
                socket.join(matchId);
            

            console.log(`User ${
                await getUser(socket.id)
            } joined room ${matchId}`);
        });

        socket.on('disconnect', async () => {
            console.log('user disconnected');
            socket.removeAllListeners();
            delete connections[await getUser(socket.id)];
        })

        socket.on('checkUserOnline', async (userId) => {
            let result = getSocket(userId);
            if (result != undefined && result)
                io.to(socket.id).broadcast.emit('userOnline', {user : userId , online : true});
            else
                io.to(socketId).broadcast.emit('userOnline', {user : userId , online : false});
        })
    });
}
