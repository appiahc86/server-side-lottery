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
                'tickets.numbers', 'tickets.recorded', 'tickets.created_at', 'tickets.payable')
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
                'tickets.numbers', 'tickets.created_at', 'tickets.payable')
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
                .from('machine_numbers')
                .whereRaw('?? = ?', ['drawDate', date]);


            res.status(200).send({
                winners,
                winningNumbers: winningNumbers.length ? winningNumbers[0].numbers : null
            });

        }catch (e) {
            logger.error("admin/controllers/tickets getWinners");
            logger.error(e);
            return res.status(400).send("Could not fetch tickets")
        }
    },


    //Printout Tickets
    printOut: async (req, res) => {

        const { date } = req.body;

        try {
            const tickets = await db.select('tickets.id', 'users.phone as user', 'tickets.amount',
                'tickets.numbers',  'tickets.created_at', 'tickets.payable')
                .from('tickets')
                .join('users', 'users.id', 'tickets.userId')
                .where('tickets.ticketDate', date)
                .orderBy('tickets.id', 'ASC');

            res.status(200).send(tickets);

        }catch (e) {
            logger.error(e);
            logger.error("Admin controller tickets printout");
            return res.status(400).send("Could not fetch tickets")
        }

    },


    //Record Ticket
    record: async (req, res) => {
        try {

            await db('tickets').where('id', req.body.id)
                .update({recorded: true});
            res.status(200).end();

        }catch (e) {
            logger.error("admin/controllers/tickets record");
            logger.error(e);
            return res.status(400).send("Request failed")
        }
    }

}



module.exports = ticketsController