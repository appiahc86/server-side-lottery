const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");
const auth = require("../middleware/auth");

//get sms balance
router.get('/sms-balance', indexController.getSmsBalance);

//Get game status
router.get('/game-status', auth, indexController.getGameStatus);

//Get game status
router.post('/game-status', auth, indexController.setGameStatus);

//paystack
router.post('/webhook', indexController.paystack);
module.exports = router;