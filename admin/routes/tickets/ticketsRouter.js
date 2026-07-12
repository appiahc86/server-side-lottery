const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const ticketController = require("../../controllers/tickets/ticketsController")

//Get tickets
router.post('/current-tickets', auth, ticketController.currentTickets);

//search Tickets by date
router.post('/search-tickets', auth, ticketController.searchTickets);

//Get winners
router.post('/winners', auth, ticketController.getWinners);

//Printout Tickets
router.post('/print-out', auth, ticketController.printOut);

//Record Ticket
router.post('/record', auth, ticketController.record);

module.exports = router;