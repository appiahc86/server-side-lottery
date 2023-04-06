const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const ticketController = require("../../controllers/tickets/ticketsController")

//Get tickets
router.post('/current-tickets', auth, ticketController.currentTickets);

//search Tickets by date
router.post('/search-tickets', auth, ticketController.searchTickets)

//Get winners
router.post('/winners', auth, ticketController.getWinners)

module.exports = router;