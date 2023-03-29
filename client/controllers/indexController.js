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


            if (images.length){
                images.map(image => {
                    if (process.env.NODE_ENV !== 'production')
                    return image.name = `http://${req.headers.host}/images/${image.name}`;
                    else   return image.name = `https://${req.headers.host}/images/${image.name}`;
                })
            }

            res.status(200).send({images, date: moment()});
        }catch (e) {
            logger.error('client, index controller getImages');
            logger.error(e);
            return res.status(204).end();
        }
    }, // ./getImages

    //get game results
    getGameResults: async (req, res) => {
        try {
            const query = await db('machineNumbers').select('drawDate', 'numbers')
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
            const promos = await db('userPromos')
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