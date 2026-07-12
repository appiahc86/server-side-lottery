const axios = require('axios');
const db = require('./config/db');
const config = require('./config/config');
const logger = require('./winston');
const moment = require("moment/moment");

/**
 * Poll pending deposits
 */
async function pollPendingDeposits() {
    try {

        // Get all pending deposits from the last 24 hours
        const deposits = await db('transactions')
            .where('status', 'pending')
            .where('transactionType', 'deposit')
            .where('created_at', '>=', db.raw('DATE_SUB(NOW(), INTERVAL 24 HOUR)'))
            .select('referenceNumber', 'amount', 'userId');

        if (!deposits.length) return;

        // Verify each pending deposit
        for (const deposit of deposits) {
            try {

                // Verify with payment API
                const response = await  axios.get(
                    `https://api.bulkclix.com/api/v1/payment-api/checkstatus/${deposit.referenceNumber}`,

                    {
                        headers: {
                            'x-api-key': `${config.PAYMENT_API_KEY}`
                        }
                    }
                )


                if (response.status === 200) {  //if api returns 200 status

                     //check status and update database
                    if (response?.data?.data?.status === "success") { //if status is success
                        await db('transactions')
                            .where("referenceNumber", deposit.referenceNumber)
                            .update({status: "success"})
                        //Get users old balance for transaction logs
                        const user = await db("users")
                            .where("id", deposit.userId)
                            .select("id", "balance")
                            .limit(1)
                        if (user.length){
                            //Save to transaction logs
                            await db('transaction_logs')
                                .insert({
                                    userId: user[0].id,
                                    type: "deposit",
                                    amount: deposit.amount,
                                    oldBalance: user[0].balance,
                                    newBalance: parseFloat(user[0].balance) + parseFloat(deposit.amount),
                                    transaction_id: deposit.referenceNumber,
                                    description: "User Deposit",
                                    created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                                    updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                                })
                        }
                    } // ./success status

                    if (response?.data?.data?.status  === "failed") { //if status is failed
                        await db('transactions')
                            .where("referenceNumber", deposit.referenceNumber)
                            .update({status: "failed"})
                    }

                }

                // Add a small delay to avoid hitting rate limits
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                if (error.code === "ER_DUP_ENTRY") logger.error("transaction log created already")
                else {
                    logger.error(`Error verifying deposit  ${deposit.referenceNumber}:`, {
                        error: error.response?.data || error.message,
                    });
                }

            }
        }



    } catch (error) {
        logger.error('Error in payment  polling service:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

module.exports = {
    pollPendingDeposits
};