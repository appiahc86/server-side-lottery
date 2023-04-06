const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");

const ticketsController = {

    //get tickets
    currentTickets: async (req, res) => {

            const { day } = req.body;
            let queryDate = day === 'today' ? moment().format("YYYY-MM-DD") : moment().add(1, 'days').format("YYYY-MM-DD");

        try {
            const tickets = await db.select('tickets.id', 'users.phone as user', 'tickets.amount',
                'tickets.numbers', 'tickets.createdAt', 'tickets.payable')
                .from('tickets')
                .join('users', 'users.id', 'tickets.userId')
                .where('tickets.ticketDate', queryDate)
                .orderBy('tickets.id', 'ASC');
            res.status(200).send(tickets);

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not fetch tickets")
        }

    },


    //Search Tickets by date
    searchTickets: async (req, res) => {

        try {
            const { date } = req.body;

            const tickets = await db.select('tickets.id', 'users.phone as user', 'tickets.amount',
                'tickets.numbers', 'tickets.createdAt', 'tickets.payable')
                .from('tickets')
                .join('users', 'users.id', 'tickets.userId')
                .where('tickets.ticketDate', date)
                .orderBy('tickets.id', 'ASC');

            res.status(200).send(tickets);

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not fetch tickets")
        }
    },

    //Get winners for a particular date
    //Search Tickets by date
    getWinners: async (req, res) => {

        try {
            const { date } = req.body;

            const winners = await db.select('winners.id', 'winners.numbers', 'winners.amountWon',
                'winners.ticketDate', 'tickets.amount', 'tickets.payable', 'users.phone')
                .from('winners')
                .join('tickets', 'tickets.id', '=', 'winners.ticketId')
                .join('users', 'users.id', '=', 'winners.userId')
                .whereRaw('?? = ?', ['winners.ticketDate', date]);

            const winningNumbers = await db.select('numbers')
                .from('machineNumbers')
                .whereRaw('?? = ?', ['drawDate', date]);


            res.status(200).send({
                winners,
                winningNumbers: winningNumbers.length ? winningNumbers[0].numbers : null
            });

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not fetch tickets")
        }
    }

}



module.exports = ticketsController