const { UserSchema } = require("../models/User");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const CustomError = require("../utils/customError");
const generateUserToken = require("../utils/generateToken");
const { AppDataSource } = require("../config/dataSource");
const User = require("../models/User");

// Define entity type
const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const registerUser = async (req) => {
    try {
        const { username, email, password } = req.body;
        const userRepo = AppDataSource.getRepository(User);

        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser) throw new CustomError("Email already registered", 404)

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = userRepo.create({ username, email, password: hashedPassword, tier: { id: 1 }});
        await userRepo.save(user);

        return { success: true, message: "User registered successfully" };

    } catch (error) {
        console.error("Error during sign-up:", error.message);
        throw new Error(error.message);
    }
};

const authenticateUser = async (email, password) => {
    try {
        await loginSchema.validateAsync({ email, password });
        const userRepo = AppDataSource.getRepository(User);

        // Fetch user with tier and features
        const user = await userRepo.findOne({
            where: { email },
            relations: ["tier", "tier.features"], // Eager load tier + features
        });

        if (!user) {
            throw new CustomError("Invalid Credentials", 404);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new CustomError("Invalid Credentials", 404);
        }

        const tokenPayload = {
            id: user.id,
            name: user.username,
            email: user.email,
            tier: user.tier,
        };

        const tokens = generateUserToken(tokenPayload);
        return tokens;
    } catch (error) {
        console.log(error.message);
        throw new CustomError(error.message, 401);
    }
};

module.exports = {
    registerUser,
    authenticateUser,
};