const { AppDataSource } = require("../config/dataSource");
const User = require("../models/User");
const authService = require("../services/authServices");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const OTP_EXPIRATION_MINUTES = 10; // OTP expires in 10 minutes

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in", // SMTP server for Zoho
  port: 465, // Use port 465 for SSL
  secure: true, // Use SSL
  auth: {
    user: "alert@luqatech.com", // Your Zoho email
    pass: "D@E93fG7#@KWiRZ", // Your Zoho email password or app-specific password
  },
});

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

const sendOtpController = async (req, res) => {
  try {
    const AppDataSource = await tenantDataSource.getAppDataSource();
    const userOtpRepository = AppDataSource.getRepository(UserOtpSchema);
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);
    const existingEmails = await userRepository.findOne({
      where: { email }
    });

    if (existingEmails) {
      return res.status(400).json({ error: "User with same email already exists" });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Create the expiration date by adding minutes to the current date
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRATION_MINUTES);
    // Check if an OTP already exists for the email
    const existingOtp = await userOtpRepository.findOne({ where: { email } });

    if (existingOtp) {
      // If OTP exists, update the existing record with the new OTP and expiration
      existingOtp.otp = otp;
      existingOtp.expiresAt = expiresAt;
      await userOtpRepository.save(existingOtp);
    } else {
      // If no OTP exists, create a new record
      const newOtpEntity = userOtpRepository.create({
        email,
        otp,
        expiresAt,
      });
      await userOtpRepository.save(newOtpEntity);
    }
    // Send OTP via email
    const mailOptions = {
      from: "Luqa CRM <alert@luqatech.com>",
      to: email,
      subject: "Luqa CRM - Your One-Time Password (OTP) for Registration",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color:rgb(124, 16, 201);">Welcome to Luqa CRM!</h2>
          <p>Dear User,</p>
          <p>Thank you for registering with <strong>Luqa CRM</strong>. To complete your registration and secure your account, please use the OTP (One-Time Password) provided below:</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; border-radius: 5px; color: #333;">
            Your OTP: <span style="color: rgb(124, 16, 201);">${otp}</span>
          </div>
    
          <p>This OTP is valid for <strong>10 minutes</strong>. Please enter it in the app to verify your email address.</p>
          
          <p>If you did not request this, please ignore this email. Your account security is our priority.</p>
    
          <p>For any assistance, feel free to contact our support team at <a href="mailto:support@luqatech.com" style="color: #4A90E2; text-decoration: none;">support@luqatech.com</a>.</p>
    
          <p>Best regards,</p>
          <p><strong>The Luqa CRM Team</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #777;">This is an automated email, please do not reply.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;
  if (!otp || !email) {
    return res.status(400).json({ error: "Invalid request" });
  }
  // Verify OTP
  try {
    const AppDataSource = await tenantDataSource.getAppDataSource();
    const userOtpRepository = AppDataSource.getRepository(UserOtpSchema);
    // Find the OTP record by email and otp
    const otpRecord = await userOtpRepository.findOne({
      where: { email },
    });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid Request" });
    }
    // Check if the OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await userOtpRepository.delete({ id: otpRecord.id }); // Clean up expired OTP
      return res.status(400).json({ error: "OTP has expired" });
    }
    if (otpRecord.otp === otp) {
      await userOtpRepository.delete({ id: otpRecord.id });
      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: "OTP expired" });
  }
};

module.exports = {
  registerController,
  loginController,
  refreshTokenController,
  sendOtpController,
  verifyOtpController,
};