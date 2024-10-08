const express = require("express");
const userController = require("../controller/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create", userController.addUser);
router.get("/read", userController.viewUser)
router.patch("/update/:id", userController.updateUser);
router.delete("/delete/:id", userController.deleteUser);

// function  authentication {router}
router.post("/login", userController.login);
router.post("/logout", auth,userController.logOut);
router.post("/logout2", auth,userController.logOutAll);

module.exports = router;