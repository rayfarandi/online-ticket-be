const express = require("express");
const bookingController = require("../controller/bookingController");
const { uploadSingle } = require("../middleware/multer");

// function  authentication {router}
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.post("/create", uploadSingle, bookingController.createBooking);
router.get("/read", auth, bookingController.viewBooking);
router.get("/read/:id", auth, bookingController.showDetailBooking);

router.put(
  "/reject/:id",
  auth,
  checkRole("admin"),
  bookingController.actionReject
); //bisa mengunakan put atau patch
router.put(
  "/accept/:id",
  auth,
  checkRole("admin"),
  bookingController.actionAccept
); //bisa mengunakan put atau patch

router.delete(
  "/delete/:id",
  auth,
  checkRole("admin"),
  bookingController.deleteBooking
);

module.exports = router;
