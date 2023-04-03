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
           
            const page = req.query.page || 1;
            const pageSize = req.query.pageSize || 10;

            const data = await db.select( 'tickets.id','tickets.numbers', 'tickets.ticketDate',
                    'tickets.ticketStatus', 'tickets.amount',
                'tickets.payable', 'winners.amountWon', 'machineNumbers.numbers as winningNumbers')
                .from('tickets')
                .leftJoin('winners', 'winners.ticketId', 'tickets.id')
                .leftJoin('machineNumbers', 'machineNumbers.drawDate', 'tickets.ticketDate')
                .where('tickets.userId', req.user.id)
                .limit(pageSize)
                .offset((page - 1) * pageSize)
                .orderBy('tickets.id', 'desc')

                const total = await db('tickets')
                .where('tickets.userId', req.user.id)
                .count('* as total')

            res.status(200).send({
                data,
                page,
                pageSize,
                totalRecords: total[0].total
            });

        }catch (e) {
            logger.error('client, user index viewTickets');
            logger.error(e);
            return res.status(400).send("Sorry your request was not successful");
        }
    },
}

module.exports = userIndexController;