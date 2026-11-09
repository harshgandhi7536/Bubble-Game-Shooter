
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css_files/playerDashboard.css";
const API_URL = import.meta.env.VITE_API_URL;

const GAMES_API = `${API_URL}/api/games`;

function PlayerDashboard() {
    const navigate = useNavigate();

    const [player, setPlayer] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("bubble-shooter-user");

        if (!storedUser) {
            navigate("/");
            return;
        }

        let loggedInUser;

        try {
            loggedInUser = JSON.parse(storedUser);
        } catch {
            localStorage.removeItem("bubble-shooter-user");
            navigate("/");
            return;
        }

        if (!loggedInUser?.id) {
            navigate("/");
            return;
        }

        const controller = new AbortController();

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [dashboardResponse, historyResponse] =
                    await Promise.all([
                        fetch(
                            `${GAMES_API}/dashboard/${loggedInUser.id}`,
                            { signal: controller.signal }
                        ),
                        fetch(
                            `${GAMES_API}/history/${loggedInUser.id}`,
                            { signal: controller.signal }
                        )
                    ]);

                const dashboardData = await dashboardResponse.json();
                const historyData = await historyResponse.json();

                if (!dashboardResponse.ok) {
                    throw new Error(
                        dashboardData.message ||
                        "Unable to load player details."
                    );
                }

                if (!historyResponse.ok) {
                    throw new Error(
                        historyData.message ||
                        "Unable to load game history."
                    );
                }

                // Supports { player: {...} } or direct player object
                setPlayer(
                    dashboardData.player || dashboardData
                );

                // Supports { history: [...] } or direct array
                setHistory(
                    Array.isArray(historyData)
                        ? historyData
                        : historyData.history || []
                );

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Dashboard Error:", err);
                    setError(
                        err.message || "Something went wrong."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();

        return () => controller.abort();

    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("bubble-shooter-user");
        navigate("/");
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (error && !player) {
        return (
            <div className="dashboard-error">
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>

                <button onClick={() => navigate("/levels")}>
                    Back to Levels
                </button>
            </div>
        );
    }

    const fullName = [
        player?.firstname,
        player?.lastname
    ].filter(Boolean).join(" ");

    const stats = [
        {
            title: "Total Score",
            value: player?.totalScore ?? 0,
            icon: "🏆"
        },
        {
            title: "Best Score",
            value: player?.bestScore ?? 0,
            icon: "⭐"
        },
        {
            title: "Levels Completed",
            value: player?.levelsCompleted ?? 0,
            icon: "🎯"
        },
        {
            title: "Current Level",
            value: player?.currentLevel ?? 1,
            icon: "🚀"
        },
        {
            title: "Total Stars",
            value: player?.totalStars ?? 0,
            icon: "🌟"
        },
        {
            title: "Bubbles Popped",
            value: player?.bubblesPopped ?? 0,
            icon: "🫧"
        },
        {
            title: "Best Combo",
            value: player?.bestCombo ?? 0,
            icon: "🔥"
        },
        {
            title: "Rescues",
            value: player?.rescues ?? 0,
            icon: "💎"
        }
    ];

    return (
        <div className="player-dashboard">

            {/* Dashboard Header */}
            <header className="dashboard-header">

                <div className="dashboard-brand">
                    <span className="dashboard-logo">🫧</span>

                    <h1>
                        Bubble<span>Shooter....</span>
                    </h1>
                </div>

                <div className="dashboard-header-actions">

                    <button
                        className="back-levels-btn"
                        onClick={() => navigate("/levels")}
                    >
                        ← Back to Game
                    </button>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>
            </header>

            <main className="dashboard-container">

                {/* Welcome Section */}
                <section className="dashboard-welcome">

                    <div className="welcome-avatar">
                        {player?.firstname?.charAt(0)?.toUpperCase() || "P"}
                    </div>

                    <div className="welcome-details">

                        <p className="dashboard-eyebrow">
                            PLAYER DASHBOARD
                        </p>

                        <h2>
                            Welcome, {player?.firstname || "Player"}!
                        </h2>

                        <p>
                            Track your Bubble Shooter progress and achievements.
                        </p>

                    </div>

                    <div className="player-level-badge">
                        <span>LEVEL</span>
                        <strong>{player?.currentLevel ?? 1}</strong>
                    </div>

                </section>

                {/* Personal Information */}
                <section className="dashboard-section">

                    <div className="section-heading">
                        <div>
                            <p className="dashboard-eyebrow">ACCOUNT</p>
                            <h2>Player Information</h2>
                        </div>
                    </div>

                    <div className="player-info-card">

                        <div className="info-item">
                            <div className="info-icon">👤</div>

                            <div className="info-content">
                                <span>First Name</span>
                                <strong>
                                    {player?.firstname || "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">🧑</div>

                            <div className="info-content">
                                <span>Last Name</span>
                                <strong>
                                    {player?.lastname || "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">✨</div>

                            <div className="info-content">
                                <span>Full Name</span>
                                <strong>
                                    {fullName || "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="info-item">
                            <div className="info-icon">✉️</div>

                            <div className="info-content">
                                <span>Email Address</span>
                                <strong>
                                    {player?.email || "—"}
                                </strong>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Player Statistics */}
                <section className="dashboard-section">

                    <div className="section-heading">
                        <div>
                            <p className="dashboard-eyebrow">
                                PERFORMANCE
                            </p>

                            <h2>Your Game Statistics</h2>
                        </div>
                    </div>

                    <div className="stats-grid">

                        {stats.map((stat) => (
                            <div
                                className="stat-card"
                                key={stat.title}
                            >

                                <div className="stat-card-top">

                                    <span className="stat-icon">
                                        {stat.icon}
                                    </span>

                                    <span className="stat-title">
                                        {stat.title}
                                    </span>

                                </div>

                                <strong className="stat-value">
                                    {Number(stat.value).toLocaleString("en-IN")}
                                </strong>

                            </div>
                        ))}

                    </div>
                </section>

                {/* Game History */}
                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>
                            <p className="dashboard-eyebrow">
                                ACTIVITY
                            </p>

                            <h2>Recent Game History</h2>
                        </div>

                        <span className="history-count">
                            {history.length} Games
                        </span>

                    </div>

                    {history.length === 0 ? (

                        <div className="empty-history">

                            <span>🎮</span>

                            <h3>No Games Played Yet</h3>

                            <p>
                                Start playing Bubble Shooter to see your
                                game history here.
                            </p>

                            <button onClick={() => navigate("/levels")}>
                                Play Now
                            </button>

                        </div>

                    ) : (

                        <div className="history-table-wrapper">

                            <table className="history-table">

                                <thead>
                                    <tr>
                                        <th>Game</th>
                                        <th>Level</th>
                                        <th>Score</th>
                                        <th>Stars</th>
                                        <th>Result</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {history.map((game) => {

                                        const stars = Math.max(
                                            0,
                                            Math.min(3, Number(game.stars) || 0)
                                        );

                                        const status =
                                            game.status ||
                                            (game.completed ? "won" : "failed");

                                        return (
                                            <tr key={game._id}>

                                                <td>
                                                    {game.gameName || "Bubble Shooter"}
                                                </td>

                                                <td>
                                                    Level {game.level}
                                                </td>

                                                <td>
                                                    {Number(game.score || 0)
                                                        .toLocaleString("en-IN")}
                                                </td>

                                                <td>
                                                    {"⭐".repeat(stars)}
                                                    {stars === 0 ? "—" : ""}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`history-status ${status}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        game.completedAt ||
                                                        game.startedAt
                                                    )}
                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>

                        </div>
                    )}

                </section>

                {error && (
                    <p className="dashboard-warning">
                        Some dashboard information could not be refreshed: {error}
                    </p>
                )}

            </main>

            <footer className="dashboard-footer">
                © {new Date().getFullYear()} POPVERSE — Keep Playing, Keep Popping!
            </footer>

        </div>
    );
}

export default PlayerDashboard;
