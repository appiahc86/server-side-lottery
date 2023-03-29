const db = require("../../../config/db");
const logger = require("../../../winston");
const moment = require("moment");

const ticketsController = {

    //get current tickets
    currentTickets: async (req, res) => {

            const { day } = req.body;
            let queryDate = day === 'today' ? moment().format("YYYY-MM-DD") : moment().add(1, 'days').format("YYYY-MM-DD");

        try {
            const tickets = await db.select('tickets.id', 'users.phone as user', 'tickets.amount',
                'tickets.numbers', 'tickets.createdAt', 'tickets.payable')
                .from('tickets')
                .join('users', 'users.id', 'tickets.userId')
                .where('tickets.ticketDate', queryDate)
                .orderBy('tickets.id', 'DESC');
            res.status(200).send(tickets);

        }catch (e) {
            logger.error(e);
            return res.status(400).send("Could not fetch tickets")
        }

    }
}



module.exports = ticketsController