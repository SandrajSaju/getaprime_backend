const { Router } = require("express");
const authController = require("../controllers/authControllers");

const router = Router();

router.post("/register", authController.registerController);
router.post("/login", authController.loginController);
router.post("/refresh-token", authController.refreshTokenController);
router.post("/send-otp", authController.sendOtpController);
router.post("/verify-otp", authController.verifyOtpController);

module.exports = router;