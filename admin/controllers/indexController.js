const axios = require("axios");
const config = require("../../config/config");
const db = require("../../config/db");
const logger = require("../../winston");
const moment = require("moment");



const indexController = {

    //Get sms balance
    getSmsBalance: async (req, res) => {
        try {


            const endPoint = `http://api.smsonlinegh.com/v5/account/balance`;

            axios.post(endPoint,
                {},
                {
                    headers: {
                        'Host': 'api.smsonlinegh.com',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': config.SMS_API_KEY
                    }
                }
            ).then(response=>{
                if(response.status === 200) {
                    return res.status(200).send(`${response?.data?.data?.balance}`)
                }
                return res.status(400).end();
            }).catch((err) => {
                logger.error(err)
                return res.status(400).end();
            })


        }catch (e) {
            logger.error(e);
            res.status(400).end();
        }
    },


// Payment Webhook
    paymentWebhook: async (req, res) => {
            //validate request
          const whitelistedIps = ["3.139.45.191"];
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

        if(!whitelistedIps.includes(ip)){
            return res.status(400).end();
        }


        try {

            const data = req.body;

            //Success response
            if (data?.status === "success"){

                const userId = data.transaction_id.split('-')[1]; //Extract user id from transaction_id
                const user = await db('users').where('id', userId)
                    .select('id', 'balance')
                    .limit(1);

                //Set status to success in transactions table
                await db('transactions').where('referenceNumber', data.transaction_id)
                    .update({status: 'success'})

                if (user.length){
                    //Insert into Transaction Logs table
                    await db('transaction_logs')
                        .insert({
                            userId: user[0].id,
                            type: 'deposit',
                            amount: data.amount,
                            oldBalance: user[0].balance,
                            newBalance: user[0].balance + parseFloat(data.amount),
                            transaction_id: data.transaction_id,
                            description: "User Deposit",
                            created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                            updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                        })
                }


            }

            //failed response
             if (data?.status === "failed"){
                await db('transactions').where('referenceNumber', data.transaction_id)
                    .update({status: 'failed'})
            }

            res.status(200).end();

        }catch (e) {
            logger.error('admin, controllers indexController payment webhook');
            logger.error(e)
            res.status(400).end();
        }



    }


}



module.exports = indexController;