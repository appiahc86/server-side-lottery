const db = require("../../../config/db");

const userIndexController = {
    //View user profile
    viewProfile: async (req, res) => {

    },


    //View Tickets
    viewTickets: async (req, res) => {
        try {
            const data = await db("tickets").where('userId', req.user.id)
                .select('day', 'numbers', 'ticketDate', 'ticketId',
                    'ticketStatus', 'amount')
                .orderBy('id', 'desc').limit(20);

            res.status(200).send({data});

        }catch (e) {
            console.log(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },
}

module.exports = userIndexController;