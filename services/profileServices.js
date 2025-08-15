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
        const tierRepository = AppDataSource.getRepository(Tier);

        // Assuming Tier has a relation `features` → OneToMany / ManyToMany with Feature
        const tiers = await tierRepository.find({
            relations: ["features"], // Load features for each tier
            order: { id: "ASC" } // Optional: order tiers
        });

        // Format the output (optional)
        return tiers.map(tier => ({
            tier_id: tier.id,
            tier_name: tier.name,
            features: tier.features.map(f => ({
                feature_id: f.id,
                feature_name: f.name,
                description: f.description
            }))
        }));

    } catch (error) {
        throw new Error(error.message);
    }
};

const listAllFeaturesService = async (req) => {
    try {

        const featureRepo = AppDataSource.getRepository(Feature);
        const features = await featureRepo.find({
            select: ["id", "name"],
        });
        return features
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