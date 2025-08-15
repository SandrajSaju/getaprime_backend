const jwt = require("jsonwebtoken");
const CustomError = require("../utils/customError");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return next(new CustomError("No token provided", 400));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        console.log(req.user.tier.features);
        next();
    } catch (error) {
        console.log(error.message);
        return next(new CustomError("Invalid token", 401));
    }
};

module.exports = verifyToken;