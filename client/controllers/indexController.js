const db = require("../../config/db");
const logger = require("../../winston");



const indexController = {
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

            res.status(200).send({images, day: new Date().getDay()});
        }catch (e) {
            logger.error(e);
            return res.status(204).end();
        }
    },

    //get game results
    getGameResults: async (req, res) => {
        try {
            const query = await db('machineNumbers').select('drawDate', 'numbers')
                .orderBy('id', 'DESC').limit(1);

            res.status(200).send({gameResults: query, day: new Date().getDay()});

        }catch (e) {
            logger.error(e);
            return res.status(400).send('Sorry, Could not get game results');
        }
    }
}


module.exports = indexController;