const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const ticketController = require("../../controllers/tickets/ticketsController")

//Get game status
router.get('/current-tickets', auth, ticketController.currentTickets);


module.exports = router;