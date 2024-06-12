const db = require("../../../config/db");
const logger = require("../../../winston");
const axios = require("axios");
const config = require("../../../config/config");
const moment = require("moment/moment");

const transactionsController = {

    //Get all transactions
    index: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;
            // const today = moment().format("YYYY-MM-DD");

           const transactions = await db.select('users.phone', 'transactions.id',
               'transactions.transactionType', 'transactions.amount', 'transactions.status',
               'transactions.referenceNumber', 'transactions.createdAt',
               db.raw('COUNT(*) OVER () as total'))
                .from('transactions')
                .leftJoin('users', 'users.id', 'transactions.userId')
                .offset((page - 1) * pageSize)
                .limit(pageSize)
               .orderBy('transactions.id', 'DESC')

            const total = transactions.length ? transactions[0].total : 0;

            return res.status(200).send({
                data: transactions,
                page,
                pageSize,
                totalRecords: total
            });


        }catch (e) {
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Get Withdrawals
    withdrawals: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;
            // const today = moment().format("YYYY-MM-DD");

            const withdrawals = await db.select('users.phone', 'users.name', 'users.network',
                'transactions.id','transactions.amount', 'transactions.status',
                'transactions.referenceNumber', 'transactions.createdAt',
                db.raw('COUNT(*) OVER () as total'))
                .from('transactions')
                .leftJoin('users', 'users.id', 'transactions.userId')
                .where('transactions.transactionType', 'withdrawal')
                .andWhere('transactions.status', 'pending')
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


    //search transaction
    search: async (req, res) => {
        const { reference } = req.body;
        try {
            const transaction = await db.select('users.phone', 'transactions.id',
                'transactions.transactionType', 'transactions.amount', 'transactions.status',
                'transactions.referenceNumber', 'transactions.network','transactions.createdAt')
                .from('transactions')
                .join('users', 'users.id', 'transactions.userId')
                .where('transactions.referenceNumber', reference)
                .limit(1);

            if (!transaction.length) return res.status(400).send("Sorry, record not found");

            let url = `https://api.paystack.co/transaction/verify/${transaction[0].referenceNumber}`;
            if (transaction[0].transactionType === 'withdrawal'){
                url = `https://api.paystack.co/transfer/verify/${transaction[0].referenceNumber}`;
            }



            const response = await axios.get(url,
                {
                    headers: {'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`}
                }
                )
            if (response.status === 200){
                return res.status(200).send({localTransaction: transaction[0], gatewayResponse: response.data.data });
            }else return res.status(400).send('Sorry, Could not get response from gateway')


        }catch (e) {
            console.log(e)
            if (e.response) return res.status(400).send(e.response.data.message);
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Approve Withdrawal
    approveWithdrawal: async (req, res) => {
        const { id } = req.body;
        try {
             if (!id) return res.status(400).send("Sorry, record not found");

            await db('transactions').where('id', id)
                .update({status: 'successful'})
            res.status(200).end();
        }catch (e) {
            logger.error("admin, transactions, approve withdrawal");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Decline Withdrawal
    declineWithdrawal: async (req, res) => {
        const { id } = req.body;
        try {
            if (!id) return res.status(400).send("Sorry, record not found");

            await db('transactions').where('id', id)
                .update({status: 'failed'})
            res.status(200).end();
        }catch (e) {
            logger.error("admin, transactions, decline withdrawal");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },


}



module.exports = transactionsController;