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

        // 2. Fetch user along with tier
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: userId },
            relations: ["tier"],
        });

        if (!user || !user.tier) {
            throw new Error("User tier not found");
        }

        // 3. Get features associated with that tier
        const tier = await AppDataSource.getRepository(Tier).findOne({
            where: { id: user.tier.id },
            relations: ["features"], // Make sure Tier entity has ManyToMany with Feature
        });

        if (!tier) {
            throw new Error("Tier not found");
        }

        // 4. Return features
        return tier.features || [];

    } catch (error) {
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

        return feature;

    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    getProfileService,
    getAvailableFeatureService,
    listAllFeaturesService,
    getFeatureDetailsService,
    getAllTierWiseFeaturesService
}