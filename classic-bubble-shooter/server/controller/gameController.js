// import mongoose from "mongoose";
// import User from "../model/userModel.js";
// import GameSession from "../model/gameSessionModel.js";

// // START GAME
// export const startGame = async (req, res) => {
//     try {
//         const { userId, level } = req.body;

//         if (!mongoose.isValidObjectId(userId)) {
//             return res.status(400).json({
//                 message: "Invalid user ID"
//             });
//         }

//         if (!Number.isInteger(level) || level < 1) {
//             return res.status(400).json({
//                 message: "Invalid level"
//             });
//         }

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 message: "Player not found"
//             });
//         }

//         const session = await GameSession.create({
//             userId,
//             gameName: "Bubble Shooter",
//             level,
//             startedAt: new Date()
//         });

//         return res.status(201).json({
//             message: "Game started successfully",
//             sessionId: session._id
//         });

//     } catch (error) {
//         console.log("Start Game Error:", error);

//         return res.status(500).json({
//             message: "Unable to start game"
//         });
//     }
// };


// // COMPLETE GAME
// export const completeGame = async (req, res) => {
//     try {
//         const {
//             userId,
//             sessionId,
//             score,
//             stars,
//             shots,
//             bestCombo,
//             bubblesPopped,
//             rescues,
//             completed
//         } = req.body;

//         if (
//             !mongoose.isValidObjectId(userId) ||
//             !mongoose.isValidObjectId(sessionId)
//         ) {
//             return res.status(400).json({
//                 message: "Invalid user or session ID"
//             });
//         }

//         const values = {
//             score,
//             stars,
//             shots,
//             bestCombo,
//             bubblesPopped,
//             rescues
//         };

//         for (const [key, value] of Object.entries(values)) {
//             if (
//                 !Number.isInteger(value) ||
//                 value < 0 ||
//                 (key === "stars" && value > 3)
//             ) {
//                 return res.status(400).json({
//                     message: `Invalid ${key}`
//                 });
//             }
//         }

//         if (typeof completed !== "boolean") {
//             return res.status(400).json({
//                 message: "Invalid completion status"
//             });
//         }

//         const session = await GameSession.findOne({
//             _id: sessionId,
//             userId
//         });

//         if (!session) {
//             return res.status(404).json({
//                 message: "Game session not found"
//             });
//         }

//         if (session.status !== "playing") {
//             return res.status(409).json({
//                 message: "This game session is already finished"
//             });
//         }

//         // Save game result
//         session.score = score;
//         session.stars = stars;
//         session.shots = shots;
//         session.bestCombo = bestCombo;
//         session.bubblesPopped = bubblesPopped;
//         session.rescues = rescues;
//         session.completed = completed;

//         session.status = completed ? "won" : "failed";
//         session.completedAt = new Date();

//         await session.save();

//         // Calculate overall player statistics
//         const stats = await GameSession.aggregate([
//             {
//                 $match: {
//                     userId: new mongoose.Types.ObjectId(userId)
//                 }
//             },
//             {
//                 $group: {
//                     _id: null,

//                     totalScore: { $sum: "$score" },
//                     totalStars: { $sum: "$stars" },
//                     bubblesPopped: { $sum: "$bubblesPopped" },
//                     rescues: { $sum: "$rescues" },

//                     bestScore: { $max: "$score" },
//                     bestCombo: { $max: "$bestCombo" }
//                 }
//             }
//         ]);

//         const completedLevels = await GameSession.distinct(
//             "level",
//             {
//                 userId,
//                 completed: true
//             }
//         );

//         const levelsCompleted = completedLevels.length;

//         // Calculate next unlocked level
//         const currentLevel = Math.max(
//             1,
//             ...completedLevels
//         ) + (levelsCompleted > 0 ? 1 : 0);

//         const overall = stats[0] || {};

//         await User.findByIdAndUpdate(userId, {
//             totalScore: overall.totalScore || 0,
//             totalStars: overall.totalStars || 0,
//             bubblesPopped: overall.bubblesPopped || 0,
//             rescues: overall.rescues || 0,
//             bestScore: overall.bestScore || 0,
//             bestCombo: overall.bestCombo || 0,
//             levelsCompleted,
//             currentLevel
//         });

//         return res.status(200).json({
//             message: "Game result saved successfully",
//             session,
//             dashboard: {
//                 totalScore: overall.totalScore || 0,
//                 totalStars: overall.totalStars || 0,
//                 bubblesPopped: overall.bubblesPopped || 0,
//                 bestScore: overall.bestScore || 0,
//                 bestCombo: overall.bestCombo || 0,
//                 rescues: overall.rescues || 0,
//                 levelsCompleted,
//                 currentLevel
//             }
//         });

//     } catch (error) {
//         console.log("Complete Game Error:", error);

//         return res.status(500).json({
//             message: "Unable to save game result"
//         });
//     }
// };


// // GET PLAYER DASHBOARD
// export const getDashboard = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         if (!mongoose.isValidObjectId(userId)) {
//             return res.status(400).json({
//                 message: "Invalid user ID"
//             });
//         }

//         const user = await User.findById(userId)
//             .select("-password");

//         if (!user) {
//             return res.status(404).json({
//                 message: "Player not found"
//             });
//         }

//         return res.status(200).json({
//             message: "Dashboard fetched successfully",
//             player: user
//         });

//     } catch (error) {
//         console.log("Dashboard Error:", error);

//         return res.status(500).json({
//             message: "Unable to fetch dashboard"
//         });
//     }
// };


// // GET GAME HISTORY
// export const getGameHistory = async (req, res) => {
//     try {
//         const { userId } = req.params;

//         if (!mongoose.isValidObjectId(userId)) {
//             return res.status(400).json({
//                 message: "Invalid user ID"
//             });
//         }

//         const history = await GameSession.find({ userId })
//             .sort({ startedAt: -1 });

//         return res.status(200).json({
//             message: "Game history fetched successfully",
//             history
//         });

//     } catch (error) {
//         console.log("Game History Error:", error);

//         return res.status(500).json({
//             message: "Unable to fetch game history"
//         });
//     }
// };



import mongoose from "mongoose";
import User from "../model/userModel.js";
import GameSession from "../model/gameSessionModel.js";

// START GAME
export const startGame = async (req, res) => {
    try {
        const { userId, level } = req.body;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (!Number.isInteger(level) || level < 1) {
            return res.status(400).json({
                message: "Invalid level"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "Player not found"
            });
        }

        const currentLevel = user.currentLevel || 1;

        // Do not allow locked levels
        // Previously unlocked levels can still be replayed
        if (level > currentLevel) {
            return res.status(403).json({
                message: `Level ${level} is locked. Complete Level ${currentLevel} first.`,
                currentLevel
            });
        }

        const session = await GameSession.create({
            userId,
            gameName: "Bubble Shooter",
            level,
            status: "playing",
            startedAt: new Date()
        });

        return res.status(201).json({
            message: "Game started successfully",
            sessionId: session._id,
            currentLevel
        });

    } catch (error) {
        console.log("Start Game Error:", error);

        return res.status(500).json({
            message: "Unable to start game"
        });
    }
};


// COMPLETE GAME
export const completeGame = async (req, res) => {
    try {
        const {
            userId,
            sessionId,
            score,
            stars,
            shots,
            bestCombo,
            bubblesPopped,
            rescues,
            completed
        } = req.body;

        if (
            !mongoose.isValidObjectId(userId) ||
            !mongoose.isValidObjectId(sessionId)
        ) {
            return res.status(400).json({
                message: "Invalid user or session ID"
            });
        }

        const values = {
            score,
            stars,
            shots,
            bestCombo,
            bubblesPopped,
            rescues
        };

        for (const [key, value] of Object.entries(values)) {
            if (
                !Number.isInteger(value) ||
                value < 0 ||
                (key === "stars" && value > 3)
            ) {
                return res.status(400).json({
                    message: `Invalid ${key}`
                });
            }
        }

        if (typeof completed !== "boolean") {
            return res.status(400).json({
                message: "Invalid completion status"
            });
        }

        // Find the player's session
        const session = await GameSession.findOne({
            _id: sessionId,
            userId
        });

        if (!session) {
            return res.status(404).json({
                message: "Game session not found"
            });
        }

        if (session.status !== "playing") {
            return res.status(409).json({
                message: "This game session is already finished"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "Player not found"
            });
        }

        // Save game result
        session.score = score;
        session.stars = stars;
        session.shots = shots;
        session.bestCombo = bestCombo;
        session.bubblesPopped = bubblesPopped;
        session.rescues = rescues;

        session.completed = completed;
        session.status = completed ? "won" : "failed";
        session.completedAt = new Date();

        await session.save();

        // Advance only when the player wins their current unlocked level.
        // Replaying an earlier level will not change their progress.
        const playerCurrentLevel = user.currentLevel || 1;

        let nextLevel = playerCurrentLevel;

        if (
            completed &&
            session.level === playerCurrentLevel
        ) {
            nextLevel = playerCurrentLevel + 1;
        }

        // Calculate dashboard statistics from all game sessions
        const stats = await GameSession.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalScore: { $sum: "$score" },
                    totalStars: { $sum: "$stars" },
                    bubblesPopped: { $sum: "$bubblesPopped" },
                    rescues: { $sum: "$rescues" },
                    bestScore: { $max: "$score" },
                    bestCombo: { $max: "$bestCombo" }
                }
            }
        ]);

        // Count unique successfully completed levels
        const completedLevels = await GameSession.distinct(
            "level",
            {
                userId,
                completed: true
            }
        );

        const levelsCompleted = completedLevels.length;
        const overall = stats[0] || {};

        // Update the player's existing MongoDB document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    totalScore: overall.totalScore || 0,
                    totalStars: overall.totalStars || 0,
                    bubblesPopped: overall.bubblesPopped || 0,
                    rescues: overall.rescues || 0,
                    bestScore: overall.bestScore || 0,
                    bestCombo: overall.bestCombo || 0,
                    levelsCompleted
                },

                // Never decrease previously unlocked progress
                $max: {
                    currentLevel: nextLevel
                }
            },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            message: completed
                ? "Level completed successfully!"
                : "Game result saved. Try again!",
            session,
            dashboard: {
                totalScore: updatedUser.totalScore,
                totalStars: updatedUser.totalStars,
                bubblesPopped: updatedUser.bubblesPopped,
                bestScore: updatedUser.bestScore,
                bestCombo: updatedUser.bestCombo,
                rescues: updatedUser.rescues,
                levelsCompleted: updatedUser.levelsCompleted,
                currentLevel: updatedUser.currentLevel
            }
        });

    } catch (error) {
        console.log("Complete Game Error:", error);

        return res.status(500).json({
            message: "Unable to save game result"
        });
    }
};


// GET PLAYER DASHBOARD
export const getDashboard = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "Player not found"
            });
        }

        return res.status(200).json({
            message: "Dashboard fetched successfully",
            player: user
        });

    } catch (error) {
        console.log("Dashboard Error:", error);

        return res.status(500).json({
            message: "Unable to fetch dashboard"
        });
    }
};


// GET GAME HISTORY
export const getGameHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const history = await GameSession.find({ userId })
            .sort({ startedAt: -1 });

        return res.status(200).json({
            message: "Game history fetched successfully",
            history
        });

    } catch (error) {
        console.log("Game History Error:", error);

        return res.status(500).json({
            message: "Unable to fetch game history"
        });
    }
};
