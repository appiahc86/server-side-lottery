const express = require("express");
const router = express.Router();

const drawController = require("../../controllers/draw/drawController");
const auth = require("../../middleware/auth");

//Save draw Numbers
router.post('/numbers', auth, drawController.create);

//Get draw numbers
router.get('/numbers', auth, drawController.index);

//Delete draw
router.post('/delete', auth, drawController.destroy);

//Perform Draw
router.post("/perform", auth, drawController.performDraw);


module.exports = router;