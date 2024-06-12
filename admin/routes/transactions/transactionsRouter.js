const express = require("express");
const router = express.Router();

const transactionsController = require("../../controllers/transactions/transactionsController");
const auth = require("../../middleware/auth");

//Get Transactions
router.get('/', auth,transactionsController.index);

//Get Withdrawals
router.get('/withdrawals', auth,transactionsController.withdrawals);

//Approve Withdrawal
router.post('/withdrawals/approve', auth,transactionsController.approveWithdrawal);

//Decline Withdrawal
router.post('/withdrawals/decline', auth,transactionsController.declineWithdrawal);

//Search transaction
router.post('/single', auth, transactionsController.search);



module.exports = router;