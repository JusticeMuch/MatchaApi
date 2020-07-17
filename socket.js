const {io} = require('./index');
const {authenticateSocketToken} = require('./middleware/verifyToken');

let connections  = [];

const addConnection = async (socket) => {
    userId = (await authenticateSocketToken(socket.handshake.query.token))._id;
    connections.push({socketId : socket.id , userId : userId});
    console.log('User added with Id :' + userId);
}

const getSocketConnection = async (reference) => {
    let temp = connections.find(val => (val.userId === reference || val.socketId === reference));
    if (temp == undefined || !temp)
        return null
    return temp;
}

module.exports.socketConnect = async () =>{
    
    io.on("connection", async socket => {  
        await addConnection(socket);
        setTimeout(async () => {
           await emitNotification({message : "hwello"} , 1); 
        }, 10000);
        
        socket.on('diconnect', async () => {
            // socket.removeAllListeners()
            connections = connections.filter(data => (data.socketId === socket.id));
        })
    })
}

const emitNotification = async (notification, userId) => {
    try {
        let socketId = (await getSocketConnection(userId)).socketId;
        console.log(socketId);
        io.emit('notiification', notification);
    } catch (error) {
        console.log(error);
    }
} 