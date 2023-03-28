const express = require("express");
const router = express.Router();

const indexController = require("../controllers/indexController");
const auth = require("../middleware/auth");

//load images
router.get('/images', indexController.getImages);

//get current game results
router.get("/game-results", indexController.getGameResults);

//Get user's promos
router.get("/get-user-promos", auth, indexController.getUserPromos);

module.exports = router;