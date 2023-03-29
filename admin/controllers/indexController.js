const axios = require("axios");
const config = require("../../config/config");
const db = require("../../config/db");
const crypto = require('crypto');
const logger = require("../../winston");

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
                    logger.error(e)
                    res.status(400).end()
                })
        }catch (e) {
            logger.error(e);
            res.status(400).end();
        }
    },


// paystack Webhook
    paystack: async (req, res) => {
            //validate request
            const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
            if (hash.toString() !== req.headers['x-paystack-signature'].toString()) {
                return res.status(400).send('fuck you');
            }

        try {

            const data = req.body;

            //Success response
            if (data.event === "charge.success" || data.event === "transfer.success"){
                await db('transactions').where('referenceNumber', data.data.reference)
                    .update({status: 'successful'})


                  
                if (data.data.metadata){

                    //Set user's first deposit to true
                    if (data.data.metadata.first_deposit.toString() === '0'){
                        await db('users').where({id: data.data.metadata.user_id})
                            .update({firstDeposit: true});
                    }
                    //Set first deposit promo to active
                    const amount = parseFloat(data.data.amount) / 100;
                    if (data.data.metadata.first_deposit.toString() === '0' && amount >= 5){
                        await db('userPromos').where({promoId: 1, userId: data.data.metadata.user_id})
                            .update({active: true})
                    }

                }



                //failed response
            }else if (data.event === "transfer.failed" || data.event === "transfer.reversed"){
                await db('transactions').where('referenceNumber', data.data.reference)
                    .update({status: 'failed'})
            }


            res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers indexController paystack');
            logger.error(e)
            res.status(400).end();
        }



    }


}



module.exports = indexController;