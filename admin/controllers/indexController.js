const axios = require("axios");
const config = require("../../config/config");
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

//test paystack
    paystack: async (req, res) => {
        //validate event
        // const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
        // if (hash === req.headers['x-paystack-signature']) {
        //     // Retrieve the request's body
        //     const event = req.body;
        //     // Do something with event
        //
        //     return res.status(200).end();
        // }
        //

        //whitelist ips
        // 52.31.139.75
        // 52.49.173.169
        // 52.214.14.220

        console.log(req.body)
        //return error here
        res.status(200).end();

    }


}



module.exports = indexController;