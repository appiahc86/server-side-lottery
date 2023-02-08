const db = require("../../../config/db");
const logger = require("../../../winston");

const transactionsController = {

    //Get all transactions
    index: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;

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

}



module.exports = transactionsController;