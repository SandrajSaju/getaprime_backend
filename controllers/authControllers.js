const { AppDataSource } = require("../config/dataSource");
const User = require("../models/User");
const authService = require("../services/authServices");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

const registerController = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req);
    res.status(200).json(result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const tokens = await authService.authenticateUser(email, password);
    res.status(200).json({ tokens });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const refreshTokenController = async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    throw new CustomError("No refresh token Provided", 401);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userRepo = AppDataSource.getRepository(User);

    // Fetch user with tier and features
    const user = await userRepo.findOne({
      where: { email: decoded.email },
      relations: ["tier", "tier.features"], // Eager load tier + features
    });

    if (!user) {
      throw new CustomError("User not found", 401);
    }

    const tokenPayload = {
      id: user.id,
      name: user.username,
      email: user.email,
      tier: user.tier,
      subscription_end: user.subscription_end,
    };

    const newAccessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "5m" }
    );

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

module.exports = {
  registerController,
  loginController,
  refreshTokenController,
};