const db = require("../../config/db");
const logger = require("../../winston");
const moment = require("moment");



const indexController = {
    //get images
    getImages: async (req, res) => {
        try{
            let images = [];
            const query = await db.raw(`SELECT JSON_EXTRACT(list, '$[0]', '$[1]', '$[2]') as images FROM images;`);

            images =  JSON.parse(query[0][0].images) || [];
            let todayDrawPerformed = false;
            const today = moment().format("YYYY-MM-DD");

            const gameStatus = await db('settings').select('gameStatus')
                .where('id', 1)

            if (images.length){
                images.map(image => {
                    if (process.env.NODE_ENV !== 'production')
                    return image.name = `http://${req.headers.host}/images/${image.name}`;
                    else   return image.name = `https://${req.headers.host}/images/${image.name}`;
                })
            }

            const drawNumbers = await db('machine_numbers').orderBy('id', 'desc').limit(1);
           if (drawNumbers.length > 0){
               // if today's draw is performed
               if(moment(drawNumbers[0].drawDate).format("YYYY-MM-DD") === today && drawNumbers[0].closed)
                todayDrawPerformed = true;
           }

            // console.log(todayDrawPerformed)
            res.status(200).send({
                images,
                date: moment(),
                gameStatus: gameStatus[0].gameStatus,
                todayDrawPerformed
            });
        }catch (e) {
            logger.error('client, index controller getImages');
            logger.error(e);
            return res.status(204).end();
        }
    }, // ./getImages

    //get game results
    getGameResults: async (req, res) => {
        try {
            const query = await db('machine_numbers').select('drawDate', 'numbers')
                .orderBy('id', 'DESC').limit(1);

            res.status(200).send({gameResults: query, date: moment()});

        }catch (e) {
            logger.error('client, index controller getGameResults');
            logger.error(e);
            return res.status(400).send('Sorry, Could not get game results');
        }
    }, //./getGameResults


    //Get user promos
    getUserPromos: async (req, res) => {
        try {
            const promos = await db('user_promos')
                .where({userId: req.user.id, promoId: 1})
                .limit(1);


            if (promos.length && promos[0].active && promos[0].amount > 0){
                return res.status(200).send({promos: promos[0], balance: req.user.balance});
            }

            return res.status(200).send({promos: null, balance: req.user.balance});

        }catch (e) {
            logger.error('client, index controller getUserPromos');
            logger.error(e);
            return res.status(204).end();
        }
    } //./getUserPromos


}



module.exports = indexController;