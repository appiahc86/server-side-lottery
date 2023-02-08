const db = require("../../../config/db");
const logger = require("../../../winston");

const userIndexController = {
    //View user profile
    viewProfile: async (req, res) => {
        return res.status(400).send('Bad request')
    },


    //View Tickets
    viewTickets: async (req, res) => {
        try {
            const data = await db("tickets").where('userId', req.user.id)
                .select( 'id','numbers', 'ticketDate',
                    'ticketStatus', 'amount')
                .orderBy('id', 'desc').limit(20);

            res.status(200).send({data});

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },
}

module.exports = userIndexController;