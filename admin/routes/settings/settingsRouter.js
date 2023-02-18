const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const settingsIndexController = require("../../controllers/settings/settingsIndexController");


//Get settings
router.get('/', auth, settingsIndexController.index);

//Set game status
router.post('/game-status', auth, settingsIndexController.setGameStatus);

//Set withdrawal status
router.post('/withdrawal-status', auth, settingsIndexController.setWithdrawalStatus);

//Set deposit status
router.post('/deposit-status', auth, settingsIndexController.setDepositStatus);

module.exports = router;