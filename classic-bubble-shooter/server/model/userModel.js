import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },

    lastname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    // Player Dashboard Statistics
    currentLevel: {
        type: Number,
        default: 1
    },

    levelsCompleted: {
        type: Number,
        default: 0
    },

    totalScore: {
        type: Number,
        default: 0
    },

    totalStars: {
        type: Number,
        default: 0
    },

    bubblesPopped: {
        type: Number,
        default: 0
    },

    bestScore: {
        type: Number,
        default: 0
    },

    bestCombo: {
        type: Number,
        default: 0
    },

    rescues: {
        type: Number,
        default: 0
    },

    achievements: {
        type: [String],
        default: []
    }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;