const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const runMigration = require("./models/index");
const runTriggers = require("./models/triggers/index");
const db = require("./config/db");
const uploader = require("express-fileupload");

// express-fileupload middleware
app.use(
    uploader({
        useTempFiles: true,
        tempFileDir : '/tmp/'
    })
);


app.use(express.json());
app.use(cors());


//Set TimeZone
process.env.TZ = 'Africa/Accra';

//Create database tables
(async () => {
    await db.raw("SET FOREIGN_KEY_CHECKS=0");
    await runMigration();
    await runTriggers();
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
const lotteryRouter = require("./client/routes/lottery/index");
const userAuthRouter = require("./client/routes/users/auth/userAuthRoutes");
const usersIndexRouter = require("./client/routes/users/index");
const usersTransactionRouter = require('./client/routes/users/transactions/index');
const imagesRouter = require("./client/routes/images/index");

//Use Routes
app.use("/images", imagesRouter);
app.use("/lottery", lotteryRouter);
app.use("/users", usersIndexRouter);
app.use("/users/auth", userAuthRouter);
app.use("/users/transactions", usersTransactionRouter);

//Load Admin routes
const clientUsersRouter = require("./admin/routes/clientUsers/clientUsers");
const uploadRouter = require("./admin/routes/uploads/uploadRouter");
const drawRouter = require("./admin/routes/draw/drawRouter");

//Use Admin routes
app.use("/admin/clientUsers", clientUsersRouter);
app.use("/admin/uploads", uploadRouter);
app.use("/admin/draw", drawRouter);

app.use(express.static('public'));

//404 handler
app.use((req, res, next) => {
    res.status(400).send('404');
})


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
// server.listen();