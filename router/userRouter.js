const express = require("express");
const userController = require("../controller/userController");

// function  authentication {router}
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.post("/create", auth, checkRole("admin"), userController.addUser);
router.get("/read", auth, userController.viewUser);
router.patch(
  "/update/:id",
  auth,
  checkRole("admin"),
  userController.updateUser
);
router.delete(
  "/delete/:id",
  auth,
  checkRole("admin"),
  userController.deleteUser
);

// function  authentication {router}
router.post("/login", userController.login);
router.post("/logout", auth, userController.logOut);
router.post("/logout2", auth, userController.logOutAll);

// view me
router.get("/info", auth, userController.viewMe);

module.exports = router;
