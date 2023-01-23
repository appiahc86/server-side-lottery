const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");

//load images
router.get('/images', indexController.getImages);

//get current game results
router.get("/game-results", indexController.getGameResults);

module.exports = router;