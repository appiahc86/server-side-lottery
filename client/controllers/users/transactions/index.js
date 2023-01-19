const db = require("../../../../config/db");
// const momo = require("mtn-momo");
//
// // initialise momo library
// const { Disbursements } = momo.create({
//     callbackHost: process.env.CALLBACK_HOST
// });
//
// // initialise disbursements
// const disbursements = Disbursements({
//     userSecret: process.env.DISBURSEMENTS_USER_SECRET,
//     userId: process.env.DISBURSEMENTS_USER_ID,
//     primaryKey: process.env.DISBURSEMENTS_PRIMARY_KEY
// });
//
// // Transfer
// disbursements
//     .transfer({
//         amount: "100",
//         currency: "EUR",
//         externalId: "947354",
//         payee: {
//             partyIdType: "MSISDN",
//             partyId: "+256776564739"
//         },
//         payerMessage: "testing",
//         payeeNote: "hello",
//         callbackUrl: "https://75f59b50.ngrok.io"
//     })
//     .then(transactionId => {
//         console.log({ transactionId });
//
//         // Get transaction status
//         return disbursements.getTransaction(transactionId);
//     })
//     .then(transaction => {
//         console.log({ transaction });
//
//         // Get account balance
//         return disbursements.getBalance();
//     })
//     .then(accountBalance => console.log({ accountBalance }))
//     .catch(error => {
//         console.log(error);
//     });

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
            await db.transaction(async trx => {

                //deduct amount from users account
                await trx('users').where({id: req.user.id})
                    .decrement('balance', amount)

                //save to transactions table
            await trx('transactions').insert({
                userId: req.user.id,
                transactionType,
                amount: parseFloat(amount),
                network,
                transactionDate: new Date(),
                createdAt: new Date()
            })

            })// ./transaction

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