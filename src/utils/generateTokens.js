const jwt = require("jsonwebtoken")

function generateAccessToken(userId){
    return jwt.sign({sub: userId}, process.env.JWT_ACCESS_SECRET, {
        expressIn: process.env.ACCESS_TOKEN_EXPIRY || "1m",
    });
}

function generateRefreshToken(userId){
    return jwt.sign({ sub: userId}, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d",
    });
}

module.exports = {generateAccessToken , generateRefreshToken};