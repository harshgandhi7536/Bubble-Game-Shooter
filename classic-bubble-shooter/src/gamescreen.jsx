import React, { useCallback, useEffect, useRef, useState } from "react";
import "./css_files/gamescreen.css";
import { useNavigate } from "react-router-dom";
import { getStars } from "./gameConfig.js";
const COLS = 10;
const ROWS = 12;
const R = 17;
const GAP = 2;
const STEP_X = R * 2 + GAP;
const STEP_Y = Math.sqrt(3) * R + GAP;
const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
const HEX = {
  red: "#ff5268", blue: "#438cff", green: "#35c98b",
  yellow: "#ffd34e", purple: "#a879f7", orange: "#ff9b45"
};
const MAX_SHOTS = 25;

const randomColor = (list = COLORS) => list[Math.floor(Math.random() * list.length)];

function createBoard(level = 1) {
  const board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const colors = COLORS.slice(0, Math.min(3 + Math.floor((level - 1) / 8), 6));
  const height = Math.min(4 + Math.floor((level - 1) / 3), 8);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < COLS; col++) {
      // Small gaps make early boards readable and later boards less predictable.
      if (Math.random() > (level < 4 ? 0.08 : 0.16)) {
        board[row][col] = randomColor(colors);
      }
    }
  }
  return board;
}

function neighbors(row, col) {
  const shifts = row % 2 === 0
    ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]]
    : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
  return shifts.map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS);
}

function connectedGroup(board, row, col) {
  const color = board[row]?.[col];
  if (!color) return [];
  const queue = [[row, col]];
  const seen = new Set([`${row},${col}`]);
  const group = [];
  while (queue.length) {
    const [r, c] = queue.shift();
    group.push([r, c]);
    for (const [nr, nc] of neighbors(r, c)) {
      const key = `${nr},${nc}`;
      if (!seen.has(key) && board[nr][nc] === color) {
        seen.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  return group;
}

function removeFloating(board) {
  const connected = new Set();
  const queue = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c]) {
      queue.push([0, c]);
      connected.add(`0,${c}`);
    }
  }
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [nr, nc] of neighbors(r, c)) {
      const key = `${nr},${nc}`;
      if (board[nr][nc] && !connected.has(key)) {
        connected.add(key);
        queue.push([nr, nc]);
      }
    }
  }
  const fallen = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] && !connected.has(`${r},${c}`)) {
        fallen.push([r, c]);
        board[r][c] = null;
      }
    }
  }
  return fallen.length;
}

function cloneBoard(board) {
  return board.map(row => [...row]);
}

import clickSound from "./assests/click_sound.mp3";

export default function GameScreen({
    selectedLevel = 1,
    onLevelCleared,
    onBack
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const stateRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, down: false });
 const [level, setLevel] = useState(selectedLevel);

const [score, setScore] = useState(0);

const getShotLimit = (lvl) =>
    Math.max(15, 30 - Math.floor(lvl / 2));

const [shots, setShots] = useState(
    getShotLimit(selectedLevel)
);

// Player session information
const player = JSON.parse(
    localStorage.getItem("bubble-shooter-user") || "null"
);

const [sessionId, setSessionId] = useState(null);

// Gameplay statistics
const metricsRef = useRef({
    bubblesPopped: 0,
    currentCombo: 0,
    bestCombo: 0,
    rescues: 0
});

const completionSentRef = useRef(false);
  const [current, setCurrent] = useState("red");
  const [next, setNext] = useState("blue");
  const [status, setStatus] = useState("playing");
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [soundOn, setSoundOn] = useState(false);
const clickSoundAudio = useRef(null);
const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

useEffect(() => {
  clickSoundAudio.current = new Audio(clickSound);
  clickSoundAudio.current.preload = "auto";
  clickSoundAudio.current.volume = 0.7;

  return () => {
    clickSoundAudio.current?.pause();
    clickSoundAudio.current = null;
  };
}, []);
  

 const setup = useCallback((newLevel = level) => {

    const board = createBoard(newLevel);

    const colors = COLORS.slice(
        0,
        Math.min(3 + Math.floor((newLevel - 1) / 8), 6)
    );

    const first = randomColor(colors);
    const second = randomColor(colors);

    stateRef.current = {
        board,
        projectile: null,
        aim: { x: 0, y: -1 },
        current: first,
        next: second,
        queue: Array.from(
            { length: 80 },
            () => randomColor(colors)
        ),
        particles: [],
        fallen: [],
        lastShot: null
    };

    setCurrent(first);
    setNext(second);

    setScore(0);

    setShots(getShotLimit(newLevel));

    setLevel(newLevel);

    setStatus("playing");
    setPaused(false);
    setMessage("");

    // Reset statistics for this attempt
    metricsRef.current = {
        bubblesPopped: 0,
        currentCombo: 0,
        bestCombo: 0,
        rescues: 0
    };

}, [level]);

// SAVE COMPLETED OR FAILED GAME SESSION
useEffect(() => {

    if (
        status === "playing" ||
        !sessionId ||
        !player?.id ||
        completionSentRef.current
    ) {
        return;
    }

    const saveGameResult = async () => {

        completionSentRef.current = true;

        const completed = status === "won";

        const stars = completed
            ? getStars(level, score)
            : 0;

        const gameResult = {
    userId: player.id,
    sessionId: sessionId,
    level: level,
    score: score,
    stars: stars,

    status: completed ? "won" : "failed",

    shots: getShotLimit(level) - shots,
    bestCombo: metricsRef.current.bestCombo,
    bubblesPopped: metricsRef.current.bubblesPopped,
    rescues: metricsRef.current.rescues,

    completed: completed
};

        try {

           const response = await fetch(
    `${API_URL}/api/games/complete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(gameResult)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            console.log("Game result saved:", data);

            if (completed && onLevelCleared) {
                onLevelCleared(level, score);
            }

        } catch (error) {

            console.error("Game Result Save Error:", error);

            completionSentRef.current = false;
        }
    };

    saveGameResult();

}, [status, sessionId]);

useEffect(() => {

    setup(selectedLevel);

    startGameSession(selectedLevel);

}, []);
// useEffect(() => {
//   clickSound.current = new Audio(clickSound);
//   clickSound.current.volume = 0.7;

//   return () => {
//     if (clickSound.current) {
//       clickSound.current.pause();
//       clickSound.current = null;
//     }
//   };
// }, []);
const startGameSession = async (gameLevel) => {

    try {

        if (!player?.id) {
            console.error("Player not logged in");
            return;
        }

        completionSentRef.current = false;
        setSessionId(null);

       const response = await fetch(
    `${API_URL}/api/games/start`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userId: player.id,
                    level: gameLevel
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        setSessionId(data.sessionId);

        console.log(
            "Game session started:",
            data.sessionId
        );

    } catch (error) {

        console.error(
            "Start Game Session Error:",
            error
        );

    }
};
  const dimensions = () => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, rect.width);
    const height = Math.max(440, rect.height);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  };

  const centerOf = (row, col, width) => ({
    x: width / 2 + (col - (COLS - 1) / 2) * STEP_X + (row % 2 ? STEP_X / 2 : 0),
    y: 28 + row * STEP_Y
  });

  const findNearestCell = (x, y, board, width) => {
    let best = null;
    let bestDist = Infinity;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) continue;
        const p = centerOf(r, c, width);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestDist) { bestDist = d; best = [r, c]; }
      }
    }
    return best;
  };

const shoot = useCallback(() => {
  const s = stateRef.current;

  if (!s || status !== "playing" || paused || s.projectile) return;

  const { width, height } = dimensions();
  const launcher = { x: width / 2, y: height - 54 };

  let dx = pointerRef.current.x - launcher.x;
  let dy = pointerRef.current.y - launcher.y;

  if (!pointerRef.current.x && !pointerRef.current.y) {
    dx = 0;
    dy = -1;
  }

  const length = Math.hypot(dx, dy) || 1;
  dx /= length;
  dy /= length;

  if (dy > -0.12) return;

  // Play click sound when shooting
  if (clickSoundAudio.current) {
    clickSoundAudio.current.currentTime = 0;

    clickSoundAudio.current.play().catch((error) => {
      console.error("Sound playback error:", error);
    });
  }

  s.aim = { x: dx, y: dy };

  s.projectile = {
    x: launcher.x,
    y: launcher.y,
    vx: dx * 8.5,
    vy: dy * 8.5,
    color: s.current,
    radius: R
  };

  s.lastShot = s.current;
  s.current = s.next;
  s.next = s.queue.shift() || randomColor();

  setCurrent(s.current);
  setNext(s.next);
  setShots(v => Math.max(0, v - 1));

}, [status, paused]);

  
const updateGame = useCallback((width, height) => {
    const s = stateRef.current;

    if (!s || paused || status !== "playing") return;

    const p = s.projectile;
    if (!p) return;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < R || p.x > width - R) {
        p.vx *= -1;
    }

    let hit = p.y <= 28 + R;

    if (!hit) {
        outer: for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!s.board[r][c]) continue;

                const b = centerOf(r, c, width);

                if (Math.hypot(p.x - b.x, p.y - b.y) <= R * 2 - 1) {
                    hit = true;
                    break outer;
                }
            }
        }
    }

    if (hit) {
        const cell = findNearestCell(p.x, p.y, s.board, width);

        if (cell) {
            const [r, c] = cell;

            s.board[r][c] = p.color;

            const group = connectedGroup(s.board, r, c);

            if (group.length >= 3) {

                // Remove matching bubbles
                group.forEach(([gr, gc]) => {
                    s.board[gr][gc] = null;
                });

                // Remove floating bubbles
                const fallen = removeFloating(s.board);

                // Track bubbles popped
                const popped = group.length + fallen;
                metricsRef.current.bubblesPopped += popped;

                // Track consecutive successful pops
                metricsRef.current.currentCombo += 1;

                metricsRef.current.bestCombo = Math.max(
                    metricsRef.current.bestCombo,
                    metricsRef.current.currentCombo
                );

                // Calculate score
                const gained =
                    group.length * 10 +
                    fallen * 20 +
                    (group.length >= 5 ? 30 : 0);

                setScore(v => v + gained);

                setMessage(
                    fallen ? `CHAIN! +${gained}` : `POP! +${gained}`
                );

                // Bubble popping particles
                s.particles.push(
                    ...group.map(([gr, gc]) => {
                        const pos = centerOf(gr, gc, width);

                        return {
                            x: pos.x,
                            y: pos.y,
                            color: HEX[p.color],
                            life: 24,
                            vx: (Math.random() - 0.5) * 4,
                            vy: -Math.random() * 3
                        };
                    })
                );

            } else {
                // No successful pop: reset consecutive combo
                metricsRef.current.currentCombo = 0;
                setMessage("");
            }
        }

        // Remove the projectile after collision
        s.projectile = null;

        const remaining = s.board.flat().filter(Boolean).length;

        if (remaining === 0) {
            setStatus("won");
            setMessage("LEVEL COMPLETE!");
        } else if (shots <= 0) {
            setStatus("failed");
            setMessage("OUT OF SHOTS!");
        }
    }

}, [paused, status, shots]);


  const drawBubble = (ctx, x, y, color, radius = R) => {
    const grad = ctx.createRadialGradient(x - radius * .35, y - radius * .4, 2, x, y, radius);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(.18, HEX[color] || color);
    grad.addColorStop(1, "#17264c");
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - radius * .34, y - radius * .38, radius * .18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,.65)";
    ctx.fill();
  };

  const render = useCallback(() => {
    const { ctx, width, height } = dimensions();
    const s = stateRef.current;
    if (!s) return;
    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#172d65");
    bg.addColorStop(1, "#101936");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle board frame and stars.
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = s.board[r][c];
        if (color) {
          const b = centerOf(r, c, width);
          drawBubble(ctx, b.x, b.y, color);
        }
      }
    }

    const launcher = { x: width / 2, y: height - 54 };
    let aimX = pointerRef.current.x || launcher.x;
    let aimY = pointerRef.current.y || launcher.y - 100;
    let vx = aimX - launcher.x, vy = aimY - launcher.y;
    const len = Math.hypot(vx, vy) || 1;
    vx /= len; vy /= len;
    if (vy > -0.12) { vx = 0; vy = -1; }

    // Dotted trajectory with a single predicted wall bounce.
    ctx.save();
    ctx.setLineDash([3, 8]);
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let tx = launcher.x, ty = launcher.y;
    ctx.moveTo(tx, ty);
    for (let i = 0; i < 65; i++) {
      tx += vx * 7; ty += vy * 7;
      if (tx < R || tx > width - R) vx *= -1;
      ctx.lineTo(tx, ty);
      if (ty < 25) break;
      let collided = false;
      for (let r = 0; r < ROWS && !collided; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!s.board[r][c]) continue;
          const b = centerOf(r, c, width);
          if (Math.hypot(tx - b.x, ty - b.y) < R * 2) { collided = true; break; }
        }
      }
      if (collided) break;
    }
    ctx.stroke();
    ctx.restore();

    // Launcher barrel and base.
    ctx.save();
    ctx.translate(launcher.x, launcher.y);
    ctx.rotate(Math.atan2(vy, vx) + Math.PI / 2);
    ctx.fillStyle = "#8aa8ff";
    ctx.strokeStyle = "#dce7ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-10, -48, 20, 52, 9);
    ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#f4c95d";
    ctx.beginPath(); ctx.arc(launcher.x, launcher.y + 7, 25, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = "#fff0ae"; ctx.lineWidth = 3; ctx.stroke();

    if (s.projectile) drawBubble(ctx, s.projectile.x, s.projectile.y, s.projectile.color);
    else drawBubble(ctx, launcher.x, launcher.y - 17, s.current);

    s.particles = s.particles.filter(pt => pt.life > 0);
    s.particles.forEach(pt => {
      pt.x += pt.vx; pt.y += pt.vy; pt.vy += .12; pt.life--;
      ctx.globalAlpha = pt.life / 24;
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
    drawBubble(ctx, width - 38, height - 35, s.next, 12);
  }, []);

  useEffect(() => {
    const loop = () => {
      const { width, height } = dimensions();
      updateGame(width, height);
      render();
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [render, updateGame]);

  const getPointer = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    pointerRef.current.x = event.clientX - rect.left;
    pointerRef.current.y = event.clientY - rect.top;
  };

  const handlePointerDown = (event) => {
    if (status !== "playing" || paused) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointerRef.current.down = true;
    getPointer(event);
  };
  const handlePointerMove = (event) => {
    getPointer(event);
    if (pointerRef.current.down && event.pointerType !== "mouse") {
      // Touch release shoots; movement only updates the aim.
    }
  };
  const handlePointerUp = () => {
    if (pointerRef.current.down) shoot();
    pointerRef.current.down = false;
  };

  useEffect(() => {
    const keyHandler = (e) => {
      if (e.code === "Space") { e.preventDefault(); shoot(); }
      if (e.key.toLowerCase() === "r") setup(level);
      if (e.key === "Escape") setPaused(v => !v);
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [shoot, setup, level]);

  const nextLevel = () => {
    const n = level + 1;
    setLevel(n);
    setup(n);
  };

  return (
    <main className="bubble-game">
      <header className="game-topbar">
        <div>
          <span className="eyebrow">BUBBLE ADVENTURE</span>
          <h1>Level {String(level).padStart(2, "0")}</h1>
        </div>
        <div className="game-stats">
          <div><small>SCORE</small><strong>{score.toLocaleString()}</strong></div>
          <div><small>SHOTS</small><strong>{shots}</strong></div>
          <button className="icon-button" onClick={() => setPaused(true)} aria-label="Pause">Ⅱ</button>
        </div>
      </header>

      <section className="game-layout">
        <div className="game-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="game-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { pointerRef.current.down = false; }}
          />
          {message && <div className="game-toast">{message}</div>}
          {status !== "playing" && (
            <div className="game-overlay">
              <div className="result-card">
                <div className="result-emoji">{status === "won" ? "🏆" : "💫"}</div>
                <h2>{status === "won" ? "LEVEL COMPLETE!" : "LEVEL FAILED"}</h2>
                <p>Score: <b>{score.toLocaleString()}</b></p>
                <p>{status === "won" ? "Great shooting!" : "Try another strategy."}</p>
                <div className="result-actions">
                  {status === "won" && <button onClick={nextLevel}>Next Level</button>}
                  <button className="secondary" onClick={() => setup(level)}>Replay</button>
                </div>
              </div>
            </div>
          )}
          {paused && status === "playing" && (
            <div className="game-overlay">
              <div className="result-card">
                <h2>PAUSED</h2>
                <button onClick={() => setPaused(false)}>Resume</button>
                <button className="secondary" onClick={() => setup(level)}>Restart</button>
                <button className="secondary" onClick={() => setPaused(false)}>Settings</button>
              </div>
            </div>
          )}
        </div>

        <aside className="game-sidebar">
          <div className="preview-card">
            <span className="eyebrow">BUBBLE QUEUE</span>
            <div className="preview-row">
              <div><small>NOW</small><span className="preview-bubble" style={{ background: HEX[current] }} /></div>
              <div className="queue-arrow">→</div>
              <div><small>NEXT</small><span className="preview-bubble small" style={{ background: HEX[next] }} /></div>
            </div>
          </div>
          <div className="preview-card">
            <span className="eyebrow">HOW TO PLAY</span>
            <p>Move your mouse to aim. Click to shoot. On mobile, drag to aim and release to fire.</p>
            <p>Match 3 or more bubbles of the same color to pop them.</p>
          </div>
          <div className="preview-card control-card">
            <button onClick={() => setup(level)} className="wide-button">↻ Restart Level</button>
            <button onClick={() => setSoundOn(v => !v)} className="wide-button secondary">
              {soundOn ? "♪ Sound On" : "♫ Sound Off"}
            </button>
            <small>Keyboard: Space = shoot · R = restart · Esc = pause</small>
          </div>
        </aside>
      </section>
    </main>
  );
}
