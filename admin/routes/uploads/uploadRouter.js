const express = require("express");
const router = express.Router();

const uploadController = require("../../controllers/uploads/uploadController");
const auth = require("../../middleware/auth");

//Get all images
router.get("/", auth, uploadController.index);

//upload images
router.post("/", uploadController.create);

//arrange images
router.post('/arrange', auth, uploadController.arrange);

//Delete image
router.post('/delete', auth, uploadController.destroy);

module.exports = router;