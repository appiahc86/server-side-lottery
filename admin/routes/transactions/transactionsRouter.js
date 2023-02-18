const express = require("express");
const router = express.Router();

const transactionsController = require("../../controllers/transactions/transactionsController");
const auth = require("../../middleware/auth");

//Get Transactions
router.get('/', auth,transactionsController.index);

//Search transaction
router.post('/single', auth, transactionsController.search);

//Mark As Successful
router.post('/mark-as-successful', auth, transactionsController.markAsSuccessful)

//Mark As Failed
router.post('/mark-as-failed', auth, transactionsController.markAsFailed)


module.exports = router;