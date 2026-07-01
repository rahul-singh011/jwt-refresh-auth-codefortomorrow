const jwt = require("jsonwebtoken")
const { validationResult} = require("express-validator");
const User = require("../models/User")
const RefreshToken = require("../models/RefreshToken")
const asyncHandler = require("../utils/asyncHandler")
const {generateAccessToken , generateRefreshToken} = require("../utils/generateTokens")

function getExpiryDate(token){
    const decoded = jwt.decode(token);
    return new Date(decode.exp * 1000);
}

async function issueTokenPair(userId){
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    await RefreshToken.create({
        user: userId,
        tokenHash: RefreshToken.hashToken(refreshToken),
        expiresAt: getExpiryDate(refreshToken),
    });

    return {accessToken , refreshToken};
}

const register = asyncHandler(async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });   
    }

    const {name , email, password} = req.body;

    const existingUser = await User.findOne({email});
    if(existingUser) {
        return res.status(409).json({
            success: false,
            message: "Email already registered"
        });
    }

    const user = await User.create({ name, email , password});

    const {accessToken , refreshToken} = await issueTokenPair(user._id);


    res.status(201).json({
        success: true,
        user: {id: user._id, name: user.name, email: user.email},
        accessToken,
        refreshToken
    });
});

const login = asyncHandler(async (req,res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    const {email, password} = req.body;

    const user = await User.findOne({ email}).select("+password");
    if(!user || !(await user.comparePassowrd(password))) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }
    const {accessToken , refreshToken} = await issueTokenPair(user._id);

    res.status(200).json({
        success: true,
        user: {id: user._id, name: user.name, email : user.email },
        accessToken,
        refreshToken,
    });
});

const refreshToken = asyncHandler(async (req,res)=>{
    const {refreshToken : incomingToken} = req.body;

    if(!incomingToken){
        return res.status(400).json({
            success: false,
            message: "Refresh token is required",
        });
    }

    let decoded;

    try{
        decoded: jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET);
    }catch(err){
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }


    const tokenHash = RefreshToken.hashToken(incomingToken);
    const storedToken = await RefreshToken.findOne({
        tokenHash,
        user: decoded.sub
    });

    if(!storedToken || storedToken.revoked){
        return res.status(401).json({
            success: false,
            message: "Refresh token is no longer valid"
        });

    }

    storedToken.revoked = true;
    await storedToken.save();

    const {accessToken , refreshToken: newRefreshToken} = await issueTokenPair(decodoed.sub); 

    res.status(200).json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
    });
});

module.exports= {register , login, refreshToken};

