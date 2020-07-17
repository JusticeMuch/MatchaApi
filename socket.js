const {io} = require('./index');
const {authenticateSocketToken} = require('./middleware/verifyToken');

let connections  = {}

const addConnection = async (socket) => {
    userId = (await authenticateSocketToken(socket.handshake.query.token))._id;
    connections[userId] = socket.id;
    console.log('User '+ userId +' added with socketId :' + connections[userId]);
}

module.exports.socketConnect = async () =>{
    
    io.on("connection", async socket => {  
        await addConnection(socket);
        // notifications like

        // join room
       
        
        // messages


        socket.on('diconnect', async () => {
            // socket.removeAllListeners()
            delete connections[socketId];
        })
    })
}