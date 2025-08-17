const { AppDataSource } = require("../config/dataSource");
const Feature = require("../models/Feature");
const Tier = require("../models/Tier");
const User = require("../models/User");
const CustomError = require("../utils/customError");
const nodemailer = require("nodemailer");

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sandrajdevamangalam@gmail.com", // your Gmail
        pass: "gxeu adsi wvhl tqtl", // NOT your Gmail password
    },
});

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

        // 1. Fetch user with tier and tier features
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: userId },
            relations: ["tier", "tier.features"],
        });

        if (!user || !user.tier) {
            throw new Error("User tier not found");
        }

        // 2. Fetch all features
        const allFeatures = await AppDataSource.getRepository(Feature).find();

        // 3. Get features available to this user
        const availableFeatureIds = new Set(user.tier.features.map(f => f.id));

        // 4. Mark availability
        const featuresWithAvailability = allFeatures.map((feature) => ({
            id: feature.id,
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
        const tierRepo = AppDataSource.getRepository(Tier);

        // Find user by logged-in user ID
        const user = await userRepo.findOne({ where: { id: req.user.id } });
        if (!user) throw new CustomError("No User Found", 404);

        // Update tier_id
        user.tier = { id: tierId };
        // Update subscription dates
        const subscriptionStart = new Date();
        const subscriptionEnd = new Date();
        subscriptionEnd.setDate(subscriptionEnd.getDate() + 30); // add 30 days

        user.subscription_start = subscriptionStart;
        user.subscription_end = subscriptionEnd;

        // Save updated user
        const updatedUser = await userRepo.save(user);

        // Find tier details
        const tier = await tierRepo.findOne({ where: { id: tierId } });
        
        const mailOptions = {
            from: "GETA PRIME <alert@sandrajdevamangalam@gmail.com>",
            to: user.email,
            subject: "GETA PRIME - Your Tier has been Upgarded",
            html: `<div style="font-family: Arial, sans-serif; background: #f4f4f7; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
      
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); padding: 24px; text-align: center; color: #fff;">
            <h1 style="margin: 0; font-size: 28px;">🚀 Welcome to Your New Tier</h1>
            </div>
      
            <!-- Body -->
            <div style="padding: 32px; color: #333; line-height: 1.6;">
                <p style="font-size: 18px;">Hi <b>${user.username}</b>,</p>
            <p>We're excited to let you know that your <b>GETA PRIME</b> subscription has been successfully <b>upgraded</b> to a new tier.</p>
        
            <div style="margin: 24px 0; padding: 20px; background: #f0f4ff; border-radius: 8px; text-align: center;">
                <h2 style="margin: 0; font-size: 22px; color: #2575fc;">Your New Tier: <span style="color:#6a11cb">${tier?.name}</span></h2>
            </div>

            <p>You now have access to all the powerful features included in this plan. 🎯</p>
        
            <p style="margin-top: 20px;">If you have any questions, feel free to contact our support team.</p>

            <a href="https://geta-prime.com/dashboard" 
                style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #2575fc; color: #fff; text-decoration: none; border-radius: 8px; font-size: 16px;">
                    Go to Dashboard
                </a>
                </div>
      
            <!-- Footer -->
            <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 14px; color: #777;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} GETA PRIME. All rights reserved.</p>
                </div>
            </div>
        </div>`,
        };
        transporter.sendMail(mailOptions);

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