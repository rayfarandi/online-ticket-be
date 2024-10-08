const express = require("express")
const bookingController = require("../controller/bookingController")
const { uploadMultiple, uploadSingle } = require("../middleware/multer")
const router = express.Router()

router.post("/create", uploadSingle, bookingController.createBooking)
router.get("/read", bookingController.viewBooking);
router.get("/read/:id", bookingController.showDetailBooking);

router.put("/reject/:id", bookingController.actionReject) //bisa mengunakan put atau patch
router.put("/accept/:id", bookingController.actionAccept) //bisa mengunakan put atau patch


router.delete("/delete/:id", bookingController.deleteBooking)

module.exports = router