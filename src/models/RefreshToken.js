const mongoose = require("mongoose")
const crypto = require("crypto")

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    revoked: {
        type: Boolean,
        default: true,
    },

    expiresAt: {
        type: Date,
        required: true,

    },

    createdAt: {
        type: Date,
        default: Date.now
    },
});

refreshTokenSchema.index({
    expiresAt: 1
},
{
    expireAfterSeconds: 0
});

refreshTokenSchema.statics.hashToken = function (rawToken){
    return crypto.createHash ("sha256").update(rawToken).digest("hex");
};

module.exports = mongoose.model("RefreshToken" , refreshTokenSchema);