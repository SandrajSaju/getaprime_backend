const { Router } = require("express");
const profileController = require("../controllers/profileControllers");
const verifyToken = require("../middlewares/tokenMiddlewares");
const checkFeatureAccess = require("../middlewares/checkFeatureAccess");

const router = Router();

router.get("/profile-details/:userId", verifyToken, profileController.getProfileController);
router.get("/list-all-features", verifyToken, profileController.listAllFeaturesController);
router.get("/tier-wise-features", verifyToken, profileController.getAllTierWiseFeaturesController);
router.get("/get-available-features", verifyToken, profileController.getAvailableFeaturesController);
router.get("/get-feature/:featureId", verifyToken, checkFeatureAccess, profileController.getFeatureDetailsController);
router.post("/update-tier", verifyToken, profileController.updateTierController);

module.exports = router;