const db = require("../../../config/db");

const imageController = {
    index: async (req, res) => {
        try{
            let images = [];
            const query = await db.raw(`SELECT JSON_EXTRACT(list, '$[0]', '$[1]', '$[2]') as images FROM images;`);

            images =  JSON.parse(query[0][0].images) || [];

           if (images.length){
               images.map(image => {
                   return image.name = `http://${req.headers.host}/images/${image.name}`;
               })
           }
            res.status(200).send(images);
        }catch (e) {
            console.log(e);
            // return res.status(400).send("Sorry your request was not successful");
            return res.status(204).end();
        }
    }
}

module.exports = imageController;