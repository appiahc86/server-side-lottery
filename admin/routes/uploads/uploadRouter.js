const express = require("express");
const router = express.Router();

const uploadController = require("../../controllers/uploads/uploadController");

//Get all images
router.get("/", uploadController.index);

//upload images
router.post("/", uploadController.create);

//arrange images
router.post('/arrange', uploadController.arrange);

//Delete image
router.post('/delete', uploadController.destroy);

module.exports = router;