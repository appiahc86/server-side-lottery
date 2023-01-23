const db = require("../../config/db");


const indexController = {
    getImages: async (req, res) => {
        try{
            let images = [];
            const query = await db.raw(`SELECT JSON_EXTRACT(list, '$[0]', '$[1]', '$[2]') as images FROM images;`);

            images =  JSON.parse(query[0][0].images) || [];

            if (images.length){
                images.map(image => {
                    return image.name = `http://${req.headers.host}/images/${image.name}`; //todo change to https
                })
            }
            res.status(200).send({images, day: new Date().getDay()});
        }catch (e) {
            console.log(e);
            // return res.status(400).send("Sorry your request was not successful");
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
            console.log(e);
            return res.status(400).send('Sorry, Could not get game results');
        }
    }
}



module.exports = indexController;