const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const runMigration = require("./models/index");
const db = require("./config/db");

app.use(express.json());
app.use(cors());

//Set TimeZone
process.env.TZ = 'Africa/Accra';

//Create database tables
(async () => {
    await db.raw("SET FOREIGN_KEY_CHECKS=0");
    await runMigration();
    await db.raw("SET FOREIGN_KEY_CHECKS=1");
})()


const port = process.env.port || 3000;

//Socket instance
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});


//Socket.io Connection
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

//Load routes
const lotteryRouter = require("./routes/lottery/index");
const userRouter = require("./routes/users/index");

//Use Routes
app.use("/lottery", lotteryRouter);
app.use("/users", userRouter);


//Handle errors
app.use((err, req, res, next) => {
    if(err){
        console.log(err);
        res.status(400).send("Sorry and error occurred");
    }
    next()
})


server.listen(port, () => {
    console.log(`server running on port ${port}`);
})