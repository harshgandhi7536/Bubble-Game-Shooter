
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect
} from "react";

import { useNavigate } from "react-router-dom";
import "./css_files/levels_page.css";
import Gamescreen from "./gamescreen.jsx";

const TOTAL_LEVELS = 50;

const API_URL = import.meta.env.VITE_API_URL;

function Bubble({ color, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`bubble bubble-${color} ${className}`}
    />
  );
}

function Levels_Page() {
  const navigate = useNavigate();

  // Get logged-in player
  const player = JSON.parse(
    localStorage.getItem("bubble-shooter-user") || "null"
  );

  const userId = player?.id;

  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");
  const [progressRefresh, setProgressRefresh] = useState(0);

  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showGame, setShowGame] = useState(false);

  const [shots, setShots] = useState(25);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  const levels = useMemo(
    () => Array.from(
      { length: TOTAL_LEVELS },
      (_, index) => index + 1
    ),
    []
  );

  // Fetch player's saved progress from backend
  useEffect(() => {
    if (!userId) {
      setProgressLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchPlayerProgress = async () => {
      try {
        setProgressLoading(true);
        setProgressError("");

        const response = await fetch(
          `${API_BASE_URL}/api/games/dashboard/${userId}`,
          {
            method: "GET",
            signal: controller.signal
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch player progress"
          );
        }

        const currentLevel = Number(
          data.player?.currentLevel
        );

        if (
          !Number.isInteger(currentLevel) ||
          currentLevel < 1
        ) {
          throw new Error(
            "Invalid player progress received"
          );
        }

        // 51 means all 50 levels are completed
        setUnlockedLevel(
          Math.min(TOTAL_LEVELS + 1, currentLevel)
        );

      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Progress Fetch Error:", error);
          setProgressError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setProgressLoading(false);
        }
      }
    };

    fetchPlayerProgress();

    return () => controller.abort();

  }, [userId, progressRefresh]);

  // Start or restart selected level
  const startLevel = useCallback(
    (level) => {
      if (
        level > unlockedLevel ||
        level < 1 ||
        level > TOTAL_LEVELS
      ) {
        return;
      }

      setSelectedLevel(level);
      setShots(Math.max(15, 30 - Math.floor(level / 2)));
      setScore(0);
      setMessage("");
      setShowGame(true);
    },
    [unlockedLevel]
  );

  // Called when Gamescreen clears a level
  const handleLevelCleared = useCallback(
    (level, finalScore) => {
      if (level < 1 || level > TOTAL_LEVELS) {
        return;
      }

      const nextUnlocked = Math.min(
        TOTAL_LEVELS + 1,
        level + 1
      );

      setUnlockedLevel((previous) =>
        Math.max(previous, nextUnlocked)
      );

      setScore(finalScore);

      setMessage(
        level === TOTAL_LEVELS
          ? "Amazing! You cleared all 50 levels!"
          : `Level ${level} cleared! Level ${level + 1} is unlocked.`
      );

      // Refresh the latest progress saved in the database
      setProgressRefresh((previous) => previous + 1);
    },
    []
  );

  const backToLevels = useCallback(() => {
    setShowGame(false);
  }, []);

  const completedCount = Math.min(
    unlockedLevel - 1,
    TOTAL_LEVELS
  );

  const progress = Math.round(
    (completedCount / TOTAL_LEVELS) * 100
  );

  // Login protection
  if (!player?.id) {
    return (
      <div>
        <h2>Please login first!</h2>

        <button onClick={() => navigate("/")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <main className="app-shell">

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* Top navigation */}
      <header className="topbar">

        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            backToLevels();
          }}
        >
          <span className="brand-mark">
            <Bubble color="pink" />
            <Bubble color="blue" />
            <Bubble color="yellow" />
          </span>

          <span>
            POP<span className="brand-accent">VERSE</span>
          </span>
        </a>

        <div className="topbar-right">

          <div className="player-pill">
            <span className="player-avatar">✦</span>

            <span>
              {player.firstname} {player.lastname}
            </span>
          </div>

          <button
            className="dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            👤 Dashboard
          </button>

          <div className="coin-pill">
            <span>✧</span> {Math.max(120, score + 120)}
          </div>

        </div>
      </header>

      {!showGame ? (

        /* ================= LEVEL SELECTION PAGE ================= */

        <section className="level-page" id="home">

          <div className="hero-copy">

            <div className="eyebrow">
              <span className="eyebrow-dot" />
              THE COLORFUL PUZZLE ADVENTURE
            </div>

            <h1>
              Ready, aim,
              <br />
              <span>POP!</span>
            </h1>

            <div className="level-hero-copy3">

              <p className="hero-description">
                Match the colors, clear the board, and make your
                way through 50 bubble-popping levels.
              </p>

              <div className="hero-stats">

                <div className="stat-card">
                  <span className="stat-icon">🏆</span>

                  <div>
                    <strong>
                      {completedCount}/50
                    </strong>

                    <small>Levels cleared</small>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-icon">🎯</span>

                  <div>
                    <strong>
                      {unlockedLevel > TOTAL_LEVELS
                        ? "Completed"
                        : unlockedLevel}
                    </strong>

                    <small>Current level</small>
                    <p></p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Hero artwork */}
          <div className="hero-art" aria-hidden="true">

            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <Bubble
              color="pink"
              className="hero-bubble bubble-large bubble-float-a"
            />

            <Bubble
              color="blue"
              className="hero-bubble bubble-large bubble-float-b"
            />

            <Bubble
              color="yellow"
              className="hero-bubble bubble-medium bubble-float-c"
            />

            <Bubble
              color="purple"
              className="hero-bubble bubble-medium bubble-float-d"
            />

            <Bubble
              color="green"
              className="hero-bubble bubble-small bubble-float-e"
            />

            <Bubble
              color="pink"
              className="hero-bubble bubble-small bubble-float-f"
            />

            <div className="target-rings">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="sparkle sparkle-a">✦</div>
            <div className="sparkle sparkle-b">✧</div>
            <div className="sparkle sparkle-c">✦</div>

          </div>

          {/* Level grid */}
          <section className="levels-section">

            <div className="section-heading">

              <div>
                <span className="section-kicker">
                  YOUR JOURNEY
                </span>

                <h2>Choose a level</h2>

                <p>
                  Complete a level to unlock the next challenge.
                </p>
              </div>

              <div className="progress-wrap">

                <div className="progress-label">
                  <span>YOUR PROGRESS</span>
                  <strong>{progress}%</strong>
                </div>

                <div className="progress-track">
                  <span
                    style={{ width: `${progress}%` }}
                  />
                </div>

              </div>
            </div>

            {progressLoading && (
              <div className="game-message">
                Loading your progress...
              </div>
            )}

            {progressError && (
              <div className="game-message">
                {progressError}

                <button
                  type="button"
                  onClick={() =>
                    setProgressRefresh((previous) => previous + 1)
                  }
                >
                  Retry
                </button>
              </div>
            )}

            {message && (
              <div
                className="game-message success-message"
                role="status"
              >
                {message}
              </div>
            )}

            <div className="level-grid">

              {levels.map((level) => {

                const locked = level > unlockedLevel;
                const completed = level < unlockedLevel;

                return (
                  <button
                    type="button"
                    key={level}
                    className={[
                      "level-tile",
                      locked ? "is-locked" : "",
                      completed ? "is-completed" : "",
                      level === unlockedLevel ? "is-current" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => startLevel(level)}
                    disabled={locked || progressLoading}
                    aria-label={
                      locked
                        ? `Level ${level}, locked`
                        : `Play level ${level}${
                            completed ? ", completed" : ""
                          }`
                    }
                    title={
                      locked
                        ? "Clear the previous level to unlock"
                        : `Play level ${level}`
                    }
                  >

                    <span className="tile-number">
                      {String(level).padStart(2, "0")}
                    </span>

                    {locked ? (
                      <span className="tile-status lock-icon">
                        ⌑
                      </span>
                    ) : completed ? (
                      <span className="tile-status check-icon">
                        ✓
                      </span>
                    ) : (
                      <span className="tile-status play-icon">
                        ▶
                      </span>
                    )}

                    <span className="tile-dots">
                      <i />
                      <i />
                      <i />
                    </span>

                  </button>
                );
              })}

            </div>

            <div className="levels-footer">

              <span>
                <i className="legend-dot legend-current" />
                Current level
              </span>

              <strong>
                {unlockedLevel > TOTAL_LEVELS
                  ? "All cleared!"
                  : unlockedLevel}
              </strong>

              <br />

              <span>
                <i className="legend-dot legend-done" />
                Completed
                <strong>{completedCount}</strong>
              </span>

              <span>
                <i className="legend-dot legend-locked" />
                Locked
                <strong>
                  {Math.max(0, TOTAL_LEVELS - unlockedLevel)}
                </strong>
              </span>

            </div>

          </section>

          <footer className="page-footer">
            <span>✦ Made for bubble-popping champions</span>
            <span>50 LEVELS · ENDLESS FUN</span>
          </footer>

        </section>

      ) : (

        /* ================= ACTUAL GAME SCREEN ================= */

        <Gamescreen
          key={selectedLevel}
          selectedLevel={selectedLevel}
          score={score}
          setScore={setScore}
          shots={shots}
          setShots={setShots}
          onBack={backToLevels}
          onLevelCleared={handleLevelCleared}
        />

      )}

    </main>
  );
}

export default Levels_Page;
