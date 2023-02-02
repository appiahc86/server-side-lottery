const express = require("express");
const router = express.Router();

const transactionsController = require("../../controllers/transactions/transactionsController");
const auth = require("../../middleware/auth");

//Get Transactions
router.get('/', auth,transactionsController.index);


module.exports = router;