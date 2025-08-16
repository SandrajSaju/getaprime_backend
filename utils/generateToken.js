const jwt = require("jsonwebtoken")

const generateUserToken = (tokenPayload) => {
    const accessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "5m",
        }
    );

    const refreshToken = jwt.sign(
        tokenPayload,
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "1d",
        }
    );

    return { accessToken, refreshToken };
};

module.exports = generateUserToken