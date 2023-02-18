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
            const data = await db.select( 'tickets.id','tickets.numbers', 'tickets.ticketDate',
                    'tickets.ticketStatus', 'tickets.amount',
                'tickets.payable', 'winners.amountWon')
                .from('tickets')
                .leftJoin('winners', 'winners.ticketId', 'tickets.id')
                .where('tickets.userId', req.user.id)
                .orderBy('tickets.id', 'desc').limit(20);


            res.status(200).send({data});

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },
}

module.exports = userIndexController;