const express = require("express");
const router = express.Router();

const dashBoardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

router.get('/', auth, dashBoardController.index);


module.exports = router;