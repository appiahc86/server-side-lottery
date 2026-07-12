const db = require("../../config/db");
const logger = require("../../winston");
const moment = require("moment");

const dashboardController = {
    index: async (req, res) => {
        try{

            const startOfYear = `${moment().year()}-01-01`;
            const todayStart = moment().format("YYYY-MM-DD") + " 00:00:00";
            const todayEnd = moment().format("YYYY-MM-DD") + " 23:59:59";

            //get users count  2026-07-06 09:03:49
            const usersCount = await db.raw(`SELECT COUNT(*) as 'count' FROM users;`);

            //Annual Winnings
            const annualWinningsQuery = await db('winners')
                .where('ticketDate', '>=', startOfYear)
                .sum('amountWon as total')


            //get today's transactions
            const transactions = await db('transactions')
                .select('amount', 'created_at', 'transactionType', 'status')
                .where("created_at", ">=", todayStart)
                .andWhere("created_at", "<=", todayEnd);


            let todaysTransactions = transactions.filter(tr => tr.status === "success");

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
                annualWinnings: annualWinningsQuery.length ? annualWinningsQuery[0]?.total || 0 : 0
            })
        }catch (e) {
            logger.error('admin, controllers dashboardController index');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    }
}


module.exports = dashboardController;