const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");
const authOrGuest = require("../middleware/authOrGuest");

//load images
router.get('/', authOrGuest, indexController.index);

module.exports = router;