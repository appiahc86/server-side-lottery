const express = require("express");
const router = express.Router();

const drawController = require("../../controllers/draw/drawController");

//Save draw Numbers
router.post('/numbers', drawController.create);

//Get draw numbers
router.get('/numbers', drawController.index);

//Perform Draw
router.post("/perform", drawController.performDraw);


module.exports = router;