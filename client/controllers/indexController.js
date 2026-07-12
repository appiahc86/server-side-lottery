const db = require("../../config/db");
const logger = require("../../winston");
const moment = require("moment");



const indexController = {
    //get images
    index: async (req, res) => {

        logger.info(req.ip);

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

            const drawNumbers = await db('machine_numbers')
                .select("numbers", "drawDate", "closed")
                .orderBy('id', 'desc').limit(1);
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
                todayDrawPerformed,
                gameResults: drawNumbers,
                balance: req?.user?.balance
            });
        }catch (e) {
            res.status(400).send('Sorry, Error Occurred');
            logger.error('client, index controller');
            logger.error(e);
        }
    }
}



module.exports = indexController;