const cron = require('cron');
const db = require("./config/db");
const config = require("./config/config");
const axios = require("axios");
// const {log} = require("winston");


const transactionJob = new cron.CronJob('*/1 * * * *', async () => { // This function will be executed every 1 minutes
    try {
        //Get pending transactions from db
        const pending = await db('transactions').select('id', 'referenceNumber')
            .where('status', 'pending').limit(5);

        //If found
        if (pending.length){

            for (const pend of pending){
                // Verify each status from paystack
                const response = await axios.get(`https://api.paystack.co/transaction/verify/${pend.referenceNumber}`,
                    {
                        headers: {'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`}
                    }
                );

                //if successful transaction
                if (response.data.status === true && response.data.data.status === 'success'){
                    await db('transactions').where('id', pend.id).update({status: 'successful'})
                }
                //if transaction fails
                else if(response.data.status === true && response.data.data.status === 'failed' ){
                    await db('transactions').where('id', pend.id).update({status: 'failed'})
                }

            } //./for of loop

        } //.If pending transactions found

    }catch (e) {
        console.log(e)
    }

});


module.exports = transactionJob;