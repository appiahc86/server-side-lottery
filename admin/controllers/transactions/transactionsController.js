const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment/moment");
const {generateReferenceNumber} = require("../../../functions");

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
            logger.error("admin/transactions/index");
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

    //Deposit number lookup
    lookup: async (req, res) => {
        const { phoneNumber } = req.body;
        try {
            // validation
            if (phoneNumber.toString().length  !== 9 )return res.status(400).send("Please check phone number");

            const foundNumber = await db('users')
                .select("id","phone", "name", "network", "balance")
                .where("phone", phoneNumber)
                .limit(1)

            if (!foundNumber.length)return res.status(400).send("Sorry, this phone number was not found");

            return res.status(200).send({data: foundNumber[0]});
        }catch (e) {
            logger.error("admin, transactions, deposit lookup");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Deposit
    deposit: async (req, res) => {
        const { userId, amount } = req.body;
        try {
            // validation
            if (amount < 1 )return res.status(400).send("Amount cannot be less than 1");

            //reference number for withdrawal
            const referenceNumber = generateReferenceNumber(moment()) + userId;

            //save to transactions table
            await db('transactions').insert({
                referenceNumber,
                userId,
                transactionType: 'deposit',
                status: 'successful',
                amount: parseFloat(amount),
                transactionDate: moment().format("YYYY-MM-DD"),
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            })

            return res.status(200).end();
        }catch (e) {
            logger.error("admin, transactions, deposit");
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    searchSingle: async (req, res) => {
        const { referenceNumber } = req.body;
        try {

            const query = await db.select('users.phone', 'users.name', 'users.network',
                'transactions.id','transactions.amount', 'transactions.status',
                'transactions.referenceNumber', 'transactions.transactionType', 'transactions.createdAt',)
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