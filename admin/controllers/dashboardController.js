const db = require("../../config/db");
const logger = require("../../winston");
const moment = require("moment");

const dashboardController = {
    index: async (req, res) => {
        try{

            const startOfYear = `${moment().year()}-01-01`;
            const today = moment().format("YYYY-MM-DD");
            console.log(today)

            //get users count
            const usersCount = await db.raw(`SELECT COUNT(*) as 'count' FROM users;`);

            //Annual Winnings
            const annualWinningsQuery = await db('winners')
                .where('ticketDate', '>=', startOfYear)
                .andWhere('ticketDate', '<=', today)
                .groupBy('ticketDate')
                .sum('amountWon as total')


            //get today's transactions
            const transactions = await db('transactions')
                .select('amount', 'transactionDate', 'transactionType', 'status')
                .where({transactionDate: today});

            let todaysTransactions = transactions.filter(tr => tr.status === "successful");

            let deposits = 0;
            let withdrawals = 0;
            if (todaysTransactions.length){
                for (const tr of todaysTransactions) {
                    if (tr.transactionType === "deposit"){deposits += tr.amount}
                    else withdrawals += tr.amount
                }
            }



            return res.status(200).send({
                userCount: usersCount[0][0].count,
                deposits,
                withdrawals,
                annualWinnings: annualWinningsQuery.length ? annualWinningsQuery[0].total : 0
            })
        }catch (e) {
            logger.error('admin, controllers dashboardController index');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }
}


module.exports = dashboardController;