const winston = require('winston');
const { createLogger, format, transports } = winston;

const logger = createLogger({
    // level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.json(),
        format.prettyPrint(),
    ),
    transports: []
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: format.combine(
            format.json(),
            format.prettyPrint()
        ),
    }));
}else {
    logger.add(new transports.File({ filename: './logs/error.log', level: 'error' }));
    logger.add( new transports.File({filename: './logs/combined.log', level: 'info'}))
}


module.exports = logger;