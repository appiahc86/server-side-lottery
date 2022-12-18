const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);

const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});

const port = process.env.port || 3000;


io.on('connection', (socket) => {

    //Broadcast number of users
    // io.emit('onlineUsers', io.sockets.adapter.rooms.size);
    io.emit('onlineUsers', socket.adapter.sids.size);


        //Send Date and time
        io.emit('time', {eventTime:'2023-01-10T14:48:00.661Z', timeNow: new Date()});

    //disconnect
    socket.on('disconnect', () => {
        // io.emit('onlineUsers', io.sockets.adapter.rooms.size);
        io.emit('onlineUsers', socket.adapter.sids.size);
    })

})



server.listen(port, ()=> {
    console.log(`server running on port ${port}`);
})