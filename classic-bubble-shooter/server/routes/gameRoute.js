import express from "express";

import {
    startGame,
    completeGame,
    getDashboard,
    getGameHistory
} from "../controller/gameController.js";

const gameRoute = express.Router();

// Start a new game session
gameRoute.post("/start", startGame);

// Complete a game session
gameRoute.post("/complete", completeGame);

// Fetch player dashboard
gameRoute.get("/dashboard/:userId", getDashboard);

// Fetch game history
gameRoute.get("/history/:userId", getGameHistory);

export default gameRoute;