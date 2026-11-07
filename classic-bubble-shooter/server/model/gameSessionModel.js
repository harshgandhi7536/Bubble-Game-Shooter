import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    gameName: {
        type: String,
        default: "Bubble Shooter"
    },

    level: {
        type: Number,
        required: true
    },

    score: {
        type: Number,
        default: 0
    },

    stars: {
        type: Number,
        default: 0
    },

    shots: {
        type: Number,
        default: 0
    },

    bestCombo: {
        type: Number,
        default: 0
    },

    bubblesPopped: {
        type: Number,
        default: 0
    },

    rescues: {
        type: Number,
        default: 0
    },

    completed: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["playing", "won", "failed"],
        default: "playing"
    },

    startedAt: {
        type: Date,
        default: Date.now
    },

    completedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

const GameSession = mongoose.model(
    "GameSession",
    gameSessionSchema
);

export default GameSession;