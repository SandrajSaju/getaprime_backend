const CustomError = require("../utils/customError");

const checkFeatureAccess = (req, res, next) => {
    try {

        if (!req.user || !req.user.tier || !Array.isArray(req.user.tier.features)) {
            throw new CustomError("Unauthorized. Please log in.", 401)
        }

        const featureId = Number(req.params.featureId)

        if (!featureId) {
            return res.status(400).json({ message: "Feature id is required." });
        }

        const tierFeatures = req.user.tier.features.map(f => f.id);
        if (!tierFeatures.includes(featureId)) {
            return res.status(403).json({
                message: `This Feature is not available in your current subscription tier.`,
                upgrade: true
            });
        }
        next();

    } catch (error) {
        next(new CustomError(error.message, 401));
    }
}

module.exports = checkFeatureAccess;