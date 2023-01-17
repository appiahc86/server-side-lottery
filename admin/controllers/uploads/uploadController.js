const db = require('../../../config/db');
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../../../public/images/');

const uploadController = {
    //Get all images
    index: async (req, res) => {
        try {

            let images = [];
            const query = await db('images').select('list').limit(1);
            images = JSON.parse(query[0].list) || [];


            res.status(200).send({images, path: `http://${req.headers.host}/images/`});
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Upload images
    create: async (req, res) => {

        try {

            const query = await db('images').limit(1);
            const lists = JSON.parse(query[0].list);
            const listsSize =  lists.length;


            let files = [req.files];
            // return console.log(files[0]['images[]'])
            // files = files[0]["images[]"];
            files = files[0]['images[]'];
            // const images = [];
            // return console.log(files[0]["images"])

            if (Array.isArray(files)) { //If multiple images
                if ((listsSize + files.length) > 10) return res.status(400).send(`Sorry, images limit is 10 and ${listsSize} is already taken`);
                for (const file of files) {
                    const imgName = Date.now() + '-' + file.name;

                    file.mv(uploadDir + imgName, (err) => {
                        if (err) return res.status(400).send("Sorry, upload was not successful");
                    });
                    // images.push({name: imgName, createdAt: new Date()});
                    lists.unshift({name: imgName});
                }
            }else { //If single image
                if (listsSize > 9) return res.status(400).send("Sorry images are already full. Please delete some to continue");
                const imgName = Date.now() + '-' + files.name;
                files.mv(uploadDir + imgName, (err) => {
                    if (err) return res.status(400).send("Sorry, upload was not successful");
                });

                lists.unshift({name: imgName});
            }

            const updated = lists.map((item, index) => {
                item.id = index;
                return item;
            });

            //Update record in db
             await db('images').where('id', 1)
                 .update({list: JSON.stringify(updated)});
            return res.status(200).end();
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    arrange: async (req, res) => {
        try {
            const { images } =  req.body;

            const updated = images.map((item, index) => {
                item.id = index;
                return item;
            });
            //Update record in db
            await db('images').where('id', 1)
                .update({list: JSON.stringify(updated)});
            return res.status(200).end();
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Delete image
    destroy: async (req, res) => {
        try {
            const { image } = req.body;

            const query = await db('images').select('list').limit(1);
            let images = JSON.parse(query[0].list) || [];

            //Remove image from the list
            newImages = images.filter(img =>  {
                return img.id.toString() !== image.id.toString();
            })

            //delete image from hard disk
             fs.unlink(uploadDir + image.name, (err) => {
                 if (err) {
                     console.log(err) ;
                     return res.status(400).send("Sorry, failed to remove image");
                 }
             });

            //set image IDs
            const updated = newImages.map((item, index) => {
                item.id = index;
                return item;
            });

            //save updated images to db
            await db('images').where('id', 1)
                .update({list: JSON.stringify(updated)});
           return  res.status(200).send({images: updated});
        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

}

module.exports = uploadController;