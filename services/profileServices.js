const { AppDataSource } = require("../config/dataSource");
const Feature = require("../models/Feature");
const Tier = require("../models/Tier");
const User = require("../models/User");
const CustomError = require("../utils/customError");

const getProfileService = async (req) => {
    try {
        const { userId } = req.params;
        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOne({ where: { id: Number(userId) } });

        if (!user) {
            throw new CustomError("User not found");
        }

        // Return user data (omit password)
        const { password, ...userData } = user;
        return userData;

    } catch (error) {
        console.error("Error during sign-up:", error.message);
        throw new Error(error.message);
    }
};

const getAvailableFeatureService = async (req) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            throw new Error("User ID not found in request");
        }

        // 1. Fetch user with tier
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: userId },
            relations: ["tier"],
        });

        if (!user || !user.tier) {
            throw new Error("User tier not found");
        }

        // 2. Define tier order
        const tierOrder = ["Free", "Standard", "Premium"];
        const userTierIndex = tierOrder.indexOf(user.tier.name);

        // 3. Fetch all tiers up to the user’s tier (Free + Standard if user = Standard)
        const availableTiers = await AppDataSource.getRepository(Tier).find({
            where: tierOrder.slice(0, userTierIndex + 1).map((name) => ({ name })),
            relations: ["features"],
        });

        // Collect all available features from these tiers
        const availableFeatureIds = new Set(
            availableTiers.flatMap((tier) => tier.features.map((f) => f.id))
        );

        // 4. Fetch all features
        const allFeatures = await AppDataSource.getRepository(Feature).find();

        // 5. Mark availability
        const featuresWithAvailability = allFeatures.map((feature) => ({
            id: feature.id,
            key: feature.key,
            name: feature.name,
            description: feature.description,
            category: feature.category,
            isAvailable: availableFeatureIds.has(feature.id),
        }));

        return {
            userTier: user.tier.name,
            features: featuresWithAvailability,
        };

    } catch (error) {
        console.log(error.message)
        throw new Error(error.message);
    }
};

const getAllTierWiseFeaturesService = async (req) => {
    try {
        // const tierRepository = AppDataSource.getRepository(Tier);
        // const tiers = await tierRepository.find({
        //     relations: ["features"], // Load features for each tier
        //     order: { id: "ASC" } // Optional: order tiers
        // });
        // return tiers.map(tier => ({
        //     tier_id: tier.id,
        //     tier_name: tier.name,
        //     features: tier.features.map(f => ({
        //         feature_id: f.id,
        //         feature_name: f.name,
        //         description: f.description
        //     }))
        // }));
        const tierRepo = AppDataSource.getRepository(Tier);
        const userRepo = AppDataSource.getRepository(User);

        // get all tiers and features
        const tiers = await tierRepo.find({
            relations: ["features"],
            order: { id: "ASC" },
        });

        // get logged-in user with tier
        const user = await userRepo.findOne({
            where: { id: req.user.id },
            relations: ["tier"],
        });

        // Normalize tiers (remove redundant features)
        const formattedTiers = tiers.map((tier, idx) => {
            const prevTier = idx > 0 ? tiers[idx - 1] : null;

            let features = tier.features.map((f) => ({
                id: f.id,
                name: f.name,
                description: f.description,
            }));

            let includesText = null;
            if (prevTier) {
                // remove previous tier’s features
                const prevFeatureIds = new Set(prevTier.features.map((f) => f.id));
                features = features.filter((f) => !prevFeatureIds.has(f.id));
                includesText = `Everything in ${prevTier.name} plus:`;
            }

            return {
                id: tier.id,
                name: tier.name,
                description: tier.description,
                price: tier.price,
                includesText,
                features,
            };
        });

        return {
            userTierId: user?.tier?.id || null,
            tiers: formattedTiers,
        };

    } catch (error) {
        throw new Error(error.message);
    }
};

const listAllFeaturesService = async (req) => {
    try {
        // const featureRepo = AppDataSource.getRepository(Feature);
        // const features = await featureRepo.find({
        //     select: ["id", "name"],
        // });
        // return features
        const tierRepo = AppDataSource.getRepository(Tier);
        const tiers = await tierRepo.find({ relations: ["features"] });

        // Restructure into feature list with tier access
        const featuresMap = {};

        tiers.forEach((tier) => {
            tier.features.forEach((feature) => {
                if (!featuresMap[feature.id]) {
                    featuresMap[feature.id] = {
                        id: feature.id,
                        name: feature.name,
                        category: feature.category,
                        tiers: {},
                    };
                }
                featuresMap[feature.id].tiers[tier.name] = true;
            });
        });

        // Ensure missing tier mapping is marked false
        const tierNames = tiers.map((t) => t.name);
        Object.values(featuresMap).forEach((feature) => {
            tierNames.forEach((t) => {
                if (!feature.tiers[t]) {
                    feature.tiers[t] = false;
                }
            });
        });

        return Object.values(featuresMap);
    } catch (error) {
        throw new Error(error.message);
    }
};

const getFeatureDetailsService = async (req) => {
    try {
        const featureId = req.params.featureId;
        const featureRepo = AppDataSource.getRepository(Feature);

        const feature = await featureRepo.findOne({
            where: { id: featureId },
        });

        if (!feature) return null;

        return {
            id: feature.id,
            name: feature.name,
            description: feature.description,
            category: feature.category,
        };

    } catch (error) {
        throw new Error(error.message);
    }
};

const updateTierService = async (req) => {
    try {
        const tierId = req.body.tierId;
        const userRepo = AppDataSource.getRepository(User);

        // Find user by logged-in user ID
        const user = await userRepo.findOne({ where: { id: req.user.id } });
        if (!user) throw new CustomError("No User Found", 404);
        
        // Update tier_id
        user.tier = { id: tierId };
        // Save updated user
        await userRepo.save(user);

        return {
            success: true,
            message: "Tier updated successfully",
            user,
        };

    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getProfileService,
    getAvailableFeatureService,
    listAllFeaturesService,
    getFeatureDetailsService,
    getAllTierWiseFeaturesService,
    updateTierService
}