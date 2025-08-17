const { Router } = require("express");
const authController = require("../controllers/authControllers");

const router = Router();

router.post("/register", authController.registerController);
router.post("/login", authController.loginController);
router.post("/refresh-token", authController.refreshTokenController);

module.exports = router;