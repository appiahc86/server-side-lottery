const cron = require('cron');
const db = require("./config/db");
const config = require("./config/config");
const axios = require("axios");


const transactionJob = new cron.CronJob('*/3 * * * *', async () => { // This function will be executed every 3 minutes
    try {
        //Get pending transactions from db
        const pending = await db('transactions')
            .select('id', 'referenceNumber', 'transactionType')
            .where('status', 'pending').limit(8);

        //If pending transactions found
        if (pending.length){

            for (const pend of pending){
                // Verify each status from paystack
                let url = `https://api.paystack.co/transaction/verify/${pend.referenceNumber}`;
                if (pend.transactionType === 'withdrawal'){
                    url = `https://api.paystack.co/transfer/verify/${pend.referenceNumber}`;
                }
                const response = await axios.get(url,
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
        console.log(e.response)
    }

});


module.exports = transactionJob;