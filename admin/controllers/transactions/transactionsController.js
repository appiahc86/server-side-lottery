const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment/moment");
const {generateReferenceNumber} = require("../../../functions");
const {log} = require("winston");

const transactionsController = {

    //Get Latest Transactions
    index: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;
            // const today = moment().format("YYYY-MM-DD");

            const transactions = await db.select('users.phone',
                'transactions.id','transactions.amount', 'transactions.status',
                'transactions.referenceNumber', 'transactions.created_at',
                db.raw('COUNT(*) OVER () as total'))
                .from('transactions')
                .leftJoin('users', 'users.id', 'transactions.userId')
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .orderBy('transactions.id', 'desc')

            const total = transactions.length ? transactions[0].total : 0;

            return res.status(200).send({
                data: transactions,
                page,
                pageSize,
                totalRecords: total
            });


        }catch (e) {
            logger.error("admin/transactions/withdrawals");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Get Withdrawals to approve or decline
    withdrawals: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;
            // const today = moment().format("YYYY-MM-DD");

            const withdrawals = await db.select('users.phone', 'users.name', 'users.network',
                'transactions.id','transactions.amount', 'transactions.status',
                'transactions.referenceNumber', 'transactions.created_at',
                db.raw('COUNT(*) OVER () as total'))
                .from('transactions')
                .leftJoin('users', 'users.id', 'transactions.userId')
                .where('transactions.status', 'pending')
                .andWhere('transactions.transactionType', 'withdrawal')
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .orderBy('transactions.id', 'asc')

            const total = withdrawals.length ? withdrawals[0].total : 0;

            return res.status(200).send({
                data: withdrawals,
                page,
                pageSize,
                totalRecords: total
            });


        }catch (e) {
            logger.error("admin/transactions/withdrawals");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Approve Withdrawal
    approveWithdrawal: async (req, res) => {
        const { id } = req.body;
        try {
             if (!id) return res.status(400).send("Sorry, record not found");

            await db.transaction(async trx => {

                //Pull data
                const transaction = await trx("transactions").where('id', id).limit(1);

                if(!transaction.length) return res.status(400).send("This transaction was not found.");

                //Update transaction status to success
                await trx('transactions').where('id', id)
                    .update({
                        status: 'success',
                    })

                //Get user's previous balance
                const user = await trx("users")
                    .where('id', transaction[0].userId)
                    .select("balance")
                    .limit(1);



                //Save to Transaction logs
                await trx('transaction_logs')
                    .insert({
                        userId: transaction[0].userId,
                        type: "withdrawal",
                        amount: transaction[0].amount,
                        oldBalance: user[0].balance,
                        newBalance: user[0].balance - parseFloat(transaction[0].amount),
                        transaction_id: transaction[0].referenceNumber,
                        description: "User withdrawal",
                        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
                        updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                    })

            })


            res.status(200).end();
        }catch (e) {
            logger.error("admin, transactions, approve withdrawal");
            logger.error(e.message);
            return res.status(400).send("Sorry your request was not successful");
        }
    },


    //Decline Withdrawal
    declineWithdrawal: async (req, res) => {
        const { id } = req.body;
        try {
            if (!id) return res.status(400).send("Sorry, record not found");

            await db('transactions').where('id', id)
                .update({
                    status: 'failed',
                })
            res.status(200).end();
        }catch (e) {
            logger.error("admin, transactions, decline withdrawal");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },



    searchSingle: async (req, res) => {
        const { referenceNumber } = req.body;
        try {

            const query = await db.select('users.phone', 'users.name', 'users.network',
                'transactions.id','transactions.amount', 'transactions.status',
                'transactions.referenceNumber', 'transactions.transactionType', 'transactions.created_at',)
                .from('transactions')
                .join('users', 'users.id', 'transactions.userId')
                .where('transactions.referenceNumber', referenceNumber)
                .limit(1);

            return res.status(200).send({data: query[0]});
        }catch (e) {
            logger.error("admin, transactions, search single");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }

}



module.exports = transactionsController;