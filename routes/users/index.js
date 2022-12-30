const express = require("express");
const router = express.Router();

const userIndexController = require("../../controllers/users/index");
const auth = require("../../middleware/auth");

router.get("/tickets", auth, userIndexController.viewTickets);



module.exports = router;