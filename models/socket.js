const { io } = require('index.js');
const { authenticateSocketToken } = require('./../middleware/verifyToken');

// add socket id and user id to array
class Socket {

    static connectedUsers = [];

    newConnection = async(socket) => {
        const id = await authenticateSocketToken(socket.handshake.query.token)._id;
        await this.connectedUsers.push({ socketId: socket.id, userId: id });
    }

    socketConnection = async() => {
        io.on('connection', async socket => {
            await this.newConnection(socket);
        })
    }

}