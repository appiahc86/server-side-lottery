const express = require("express");
const router = express.Router();

const transactionsController = require("../../controllers/transactions/transactionsController");
const auth = require("../../middleware/auth");


//View latest transactions
router.get('/list', auth,transactionsController.index);

//List withdrawals to be approved
router.get('/withdrawals', auth,transactionsController.withdrawals);

//Approve Withdrawal
router.post('/withdrawals/approve', auth,transactionsController.approveWithdrawal);

//Decline Withdrawal
router.post('/withdrawals/decline', auth,transactionsController.declineWithdrawal);


//Search by reference number
router.post('/search-single', auth, transactionsController.searchSingle);



module.exports = router;