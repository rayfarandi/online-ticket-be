const express = require("express");
const homeController = require("../controller/homeController");
const router = express.Router();

router.get("/", homeController.homePage);

// detail page , localhost:port/api/client/item/:id
router.get("/item/:id", homeController.detailPage);

module.exports = router;
