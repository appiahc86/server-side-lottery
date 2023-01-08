const express = require("express");
const router = express.Router();

const lotteryController = require("../../controllers/lottery");
const auth = require("../../middleware/auth");

// router.get("/", );

router.post("/stake", auth, lotteryController.stake);



module.exports = router;