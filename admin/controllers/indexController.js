const axios = require("axios");
const config = require("../../config/config");
const db = require("../../config/db");
const crypto = require('crypto');
const secret = config.PAYSTACK_SECRET_KEY;

const indexController = {

    //Get sms balance
    getSmsBalance: async (req, res) => {
        try {
            axios.get(`https://sms.textcus.com/api/balance?apikey=${config.SMS_API_KEY}`)
                .then(response => {
                    if (response.data.status.toString() === '0000'){
                       return res.status(200).send(response.data.balance)
                    }
                    return res.status(400).end();
                })
                .catch(e => {
                    console.log(e)
                    res.status(400).end()
                })
        }catch (e) {
            console.log(e);
            res.status(400).end();
        }
    },


    //get game status
    getGameStatus: async (req, res)  => {
        try {
            const query = await db("gameStatus").where('id', 1).limit(1);
            return res.status(200).send({status: !!query[0].open})
        }catch (e) {
            console.log(e);
            return res.status(400).send("Could not fetch game status")
        }
    },

    //set game status
    setGameStatus: async (req, res)  => {
        try {
            const status = req.body.status;
            await db('gameStatus').where('id', 1).update({open: status})
            return res.status(200).end();
        }catch (e) {
            console.log(e);
            return res.status(400).send("Could not set game status")
        }
    },


// paystack Webhook
    paystack: async (req, res) => {
            //validate event
            const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
            if (hash.toString() !== req.headers['x-paystack-signature'].toString()) {
                return res.status(400).end();
            }

        const event = req.body;
            res.status(200).end();


    }


}



module.exports = indexController;