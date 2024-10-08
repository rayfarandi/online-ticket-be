const express = require("express");
const itemController = require("../controller/itemController");
const imagecontrroller = require("../controller/imageController");
const { uploadMultiple, uploadSingle } = require("../middleware/multer");

// function  authentication {router}
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.post(
  "/create",
  auth,
  checkRole("admin"),
  uploadMultiple,
  itemController.addItem
);
router.get("/read", itemController.viewItem);
router.patch(
  "/update/:id",
  auth,
  checkRole("admin"),
  itemController.updateItem
);
router.delete(
  "/delete/:id",
  auth,
  checkRole("admin"),
  itemController.deleteItem
);

// add image
// add image id = item._id
router.post(
  "/add-image/:id",
  uploadSingle,
  auth,
  checkRole("admin"),
  imagecontrroller.addImageItem
);

// delete image
router.delete(
  "/delete-image/:itemId/:id",
  auth,
  checkRole("admin"),
  imagecontrroller.deleteImageItem
);

module.exports = router;
