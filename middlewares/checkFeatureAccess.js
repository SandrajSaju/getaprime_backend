const { AppDataSource } = require("../config/dataSource");
const User = require("../models/User");
const CustomError = require("../utils/customError");

const checkFeatureAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new CustomError("Unauthorized. Please log in.", 401)
        }
        const featureId = Number(req.params.featureId);

        if (!featureId) {
            return res.status(400).json({ message: "Feature id is required." });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: req.user.id },
            relations: ["tier", "tier.features"],
        });

        if (!user) {
            throw new CustomError("User not found", 404);
        }

        // 🔥 Subscription validity check
        if (user.subscription_end && new Date(user.subscription_end) < new Date()) {
            // Downgrade user to free tier
            user.tier = { id: 1 };
            user.subscription_end = null;
            await userRepo.save(user);

            return res.status(403).json({
                message: "Your subscription has expired. Downgraded to Free tier.",
                expired: true,
            });
        }

        const dbFeatures = user.tier?.features?.map(f => f.id) || [];
        if (!dbFeatures.includes(featureId)) {
            return res.status(403).json({
                message: `This Feature is not available in your current subscription tier.`,
                upgrade: true,
            });
        }
        next();

    } catch (error) {
        next(new CustomError(error.message, 401));
    }
}

module.exports = checkFeatureAccess;