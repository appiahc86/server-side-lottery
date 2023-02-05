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
const winston = require('winston');
const transactionJob = require("./cron");

// express-fileupload middleware
app.use(
    uploader({
        useTempFiles: true,
        tempFileDir : '/tmp/'
    })
);


app.use(express.json());
app.use(cors());


//Run cron jobs
transactionJob.start();


//Use winston
// const logger = winston.createLogger({
//     level: 'error',
//     transports: [
//         new winston.transports.File({ filename: 'error.log' })
//     ]
// });
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error',  format: winston.format.json() }),
        new winston.transports.File({ filename: 'combined.log', level: 'info',  format: winston.format.json() }),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

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
const clientIndexRouter = require("./client/routes/indexRouter");

//Use Routes
app.use("/", clientIndexRouter);
app.use("/lottery", lotteryRouter);
app.use("/users", usersIndexRouter);
app.use("/users/auth", userAuthRouter);
app.use("/users/transactions", usersTransactionRouter);

//Load Admin routes
const adminUserAuthRouter = require("./admin/routes/users/auth/userAuthRoutes");
const adminIndexRouter = require("./admin/routes/indexRouter")
const clientUsersRouter = require("./admin/routes/clientUsers/clientUsers");
const uploadRouter = require("./admin/routes/uploads/uploadRouter");
const drawRouter = require("./admin/routes/draw/drawRouter");
const transactionsRouter = require("./admin/routes/transactions/transactionsRouter");
const dashboardRouter = require("./admin/routes/dashboardRouter");
const {log} = require("winston");

//Use Admin routes
app.use("/admin/users/auth", adminUserAuthRouter);
app.use("/admin", adminIndexRouter);
app.use("/admin/clientUsers", clientUsersRouter);
app.use("/admin/uploads", uploadRouter);
app.use("/admin/draw", drawRouter);
app.use("/admin/transactions", transactionsRouter);
app.use("/admin/dashboard", dashboardRouter);

app.use(express.static('public'));

//404 handler
app.use((req, res, next) => {
    res.status(400).send('404');
})


//Handle errors
app.use((err, req, res, next) => {
    logger.error(err.message, err);
    res.status(400).send('Sorry, something went wrong');
    next();
});

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