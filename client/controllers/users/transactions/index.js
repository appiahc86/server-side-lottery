const db = require("../../../../config/db");

const userTransactions  = {

    //Deposit Money into account
    deposit: async (req, res) => {
        const { amount, network, transactionType} = req.body;

        try {

            await db('transactions').insert({
                userId: req.user.id,
                transactionType,
                amount: parseFloat(amount),
                network,
                transactionDate: new Date()
            })

            return res.status(200).end();

        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }

    },

    //Withdraw Money
    withdraw: async (req, res) => {
        const { amount, network, transactionType} = req.body;
        if (parseFloat(req.user.balance) < parseFloat(amount)) return res.status(400).send('Sorry! your balance is not sufficient');

        try {
            await db('transactions').insert({
                userId: req.user.id,
                transactionType,
                amount: parseFloat(amount),
                network,
                transactionDate: new Date()
            })

            return res.status(200).end();

        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },

    //Get Account Balance
    getAccountBalance: (req, res) => {
        return res.status(200).send({balance: req.user.balance});
    }
}

module.exports = userTransactions;