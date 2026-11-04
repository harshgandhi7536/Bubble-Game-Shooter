
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RotateCcw,
  ArrowLeft,
  Target,
  Trophy,
} from "lucide-react";

import "./css_files/levels_page.css";

const WIDTH = 480;
const HEIGHT = 590;
const R = 16;
const GAP_X = R * 2;
const GAP_Y = Math.sqrt(3) * R;
const SPEED = 8;
const COLORS = ["pink", "blue", "yellow", "purple", "green"];

const HEX = {
  pink: "#f472b6",
  blue: "#2f80ed",
  yellow: "#f2c94c",
  purple: "#9b51e0",
  green: "#27ae60",
};

const shooterX = WIDTH / 2;
const shooterY = HEIGHT - 52;

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function position(row, col) {
  return {
    x: R + col * GAP_X + (row % 2) * R,
    y: R + row * GAP_Y,
  };
}

function makeBubble(row, col, color) {
  return {
    row,
    col,
    ...position(row, col),
    color,
  };
}

function createBoard(level) {
  const board = [];
  const rows = Math.min(5 + Math.ceil(level / 3), 10);
  const cols = 14;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const { x } = position(row, col);

      if (x + R <= WIDTH) {
        // Use groups of colours, with some variation by level.
        const colorIndex =
          (Math.floor(col / 2) + row + level) % COLORS.length;

        board.push(
          makeBubble(row, col, COLORS[colorIndex])
        );
      }
    }
  }

  return board;
}

function connectedNeighbors(bubble, board) {
  return board.filter((other) => {
    if (other === bubble) return false;

    return (
      Math.hypot(bubble.x - other.x, bubble.y - other.y) <
      GAP_X + 2
    );
  });
}

function findMatchingGroup(start, board) {
  const visited = new Set();
  const stack = [start];
  const matches = [];

  while (stack.length) {
    const current = stack.pop();

    if (visited.has(current)) continue;

    visited.add(current);
    matches.push(current);

    for (const neighbor of connectedNeighbors(current, board)) {
      if (
        neighbor.color === start.color &&
        !visited.has(neighbor)
      ) {
        stack.push(neighbor);
      }
    }
  }

  return matches;
}

export default function Gamescreen({
  selectedLevel = 1,
  score: externalScore,
  setScore: setExternalScore,
  shots: externalShots,
  setShots: setExternalShots,
  onBack,
  onLevelCleared,
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  const [localScore, setLocalScore] = useState(0);
  const [localShots, setLocalShots] = useState(
    Math.max(15, 30 - Math.floor(selectedLevel / 2))
  );
  const [message, setMessage] = useState("");
  const [currentColor, setCurrentColor] = useState(randomColor);
  const [nextColor, setNextColor] = useState(randomColor);
  const [shotsUsed, setShotsUsed] = useState(0);

  const score =
    typeof externalScore === "number" ? externalScore : localScore;

  const shots =
    typeof externalShots === "number" ? externalShots : localShots;

  const updateScore = setExternalScore || setLocalScore;
  const updateShots = setExternalShots || setLocalShots;

  const target = selectedLevel * 180;

  const resetGame = useCallback(() => {
    gameRef.current = {
      board: createBoard(selectedLevel),
      projectile: null,
      angle: -Math.PI / 2,
      bursts: [],
      gameOver: false,
      cleared: false,
    };

    updateScore(0);
    updateShots(
      Math.max(15, 30 - Math.floor(selectedLevel / 2))
    );

    setLocalScore(0);
    setLocalShots(
      Math.max(15, 30 - Math.floor(selectedLevel / 2))
    );

    setCurrentColor(randomColor());
    setNextColor(randomColor());
    setShotsUsed(0);
    setMessage("");
  }, [selectedLevel, setExternalScore, setExternalShots]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const shoot = useCallback(() => {
    const game = gameRef.current;

    if (!game || game.projectile || game.gameOver) return;

    if (shots <= 0) {
      setMessage("Out of shots! Restart this level to try again.");
      return;
    }

    game.projectile = {
      x: shooterX,
      y: shooterY,
      vx: Math.cos(game.angle) * SPEED,
      vy: Math.sin(game.angle) * SPEED,
      color: currentColor,
    };

    updateShots(Math.max(0, shots - 1));
    setShotsUsed((count) => count + 1);
    setMessage("");
  }, [shots, currentColor, updateShots]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    let animationFrame;

    function drawBubble(x, y, color, radius = R, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = HEX[color];
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        x - radius * 0.3,
        y - radius * 0.3,
        radius * 0.23,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();

      ctx.restore();
    }

    function drawArrow(game) {
      const endX = shooterX + Math.cos(game.angle) * 52;
      const endY = shooterY + Math.sin(game.angle) * 52;

      ctx.beginPath();
      ctx.moveTo(shooterX, shooterY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - Math.cos(game.angle - 0.45) * 12,
        endY - Math.sin(game.angle - 0.45) * 12
      );
      ctx.lineTo(
        endX - Math.cos(game.angle + 0.45) * 12,
        endY - Math.sin(game.angle + 0.45) * 12
      );
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    function findEmptyPosition(x, y, board) {
      let best = null;
      let bestDistance = Infinity;

      for (let row = 0; row < 25; row++) {
        for (let col = 0; col < 14; col++) {
          const p = position(row, col);

          if (
            p.x < R ||
            p.x > WIDTH - R ||
            p.y > shooterY - R
          ) {
            continue;
          }

          const occupied = board.some(
            (bubble) => bubble.row === row && bubble.col === col
          );

          if (occupied) continue;

          const distance = Math.hypot(p.x - x, p.y - y);

          if (distance < bestDistance) {
            bestDistance = distance;
            best = { row, col, ...p };
          }
        }
      }

      return best;
    }

    function attachProjectile(game) {
      const projectile = game.projectile;
      if (!projectile) return;

      const slot = findEmptyPosition(
        projectile.x,
        projectile.y,
        game.board
      );

      game.projectile = null;

      if (!slot) {
        setMessage("No space left for the bubble. Restart the level.");
        game.gameOver = true;
        return;
      }

      const attached = {
        ...slot,
        color: projectile.color,
      };

      game.board.push(attached);

      const group = findMatchingGroup(attached, game.board);

      if (group.length >= 3) {
        const removed = new Set(group);

        game.bursts.push(
          ...group.map((bubble) => ({
            x: bubble.x,
            y: bubble.y,
            color: bubble.color,
            radius: R,
            alpha: 1,
          }))
        );

        game.board = game.board.filter(
          (bubble) => !removed.has(bubble)
        );

        const gained = group.length * 10;
        const nextScore = score + gained;

        updateScore(nextScore);
        setMessage(`Great shot! +${gained} points`);
        
        if (nextScore >= target && !game.cleared) {
          game.cleared = true;
          game.gameOver = true;
          setMessage("Level cleared! Amazing shooting!");
          onLevelCleared?.(selectedLevel, nextScore);
        }
      } else {
        setMessage("No match. Aim carefully at the same colour!");
      }

      setCurrentColor(nextColor);
      setNextColor(randomColor());

      if (game.board.length === 0 && !game.cleared) {
        game.gameOver = true;
        setMessage("Board cleared! Level complete!");
        onLevelCleared?.(selectedLevel, score);
      }
    }

    function updateProjectile(game) {
      const p = game.projectile;
      if (!p) return;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x <= R || p.x >= WIDTH - R) {
        p.vx *= -1;
        p.x = Math.max(R, Math.min(WIDTH - R, p.x));
      }

      const hit = game.board.some(
        (bubble) =>
          Math.hypot(p.x - bubble.x, p.y - bubble.y) <= R * 2
      );

      if (hit || p.y <= R) {
        attachProjectile(game);
      }
    }

    function render() {
      const game = gameRef.current;
      if (!game) {
        animationFrame = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const background = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      background.addColorStop(0, "#222650");
      background.addColorStop(1, "#11152f");

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      game.board.forEach((bubble) =>
        drawBubble(bubble.x, bubble.y, bubble.color)
      );

      game.bursts.forEach((burst) => {
        drawBubble(
          burst.x,
          burst.y,
          burst.color,
          burst.radius,
          burst.alpha
        );

        burst.radius *= 0.9;
        burst.alpha -= 0.09;
      });

      game.bursts = game.bursts.filter(
        (burst) => burst.alpha > 0
      );

      drawArrow(game);
      drawBubble(shooterX, shooterY, currentColor);

      if (game.projectile) {
        drawBubble(
          game.projectile.x,
          game.projectile.y,
          game.projectile.color
        );

        updateProjectile(game);
      }

      animationFrame = requestAnimationFrame(render);
    }

    function handlePointerMove(event) {
      const rect = canvas.getBoundingClientRect();
      const mouseX =
        ((event.clientX - rect.left) / rect.width) * WIDTH;
      const mouseY =
        ((event.clientY - rect.top) / rect.height) * HEIGHT;

      const game = gameRef.current;
      if (!game) return;

      game.angle = Math.atan2(
        mouseY - shooterY,
        mouseX - shooterX
      );

      game.angle = Math.max(
        -Math.PI + 0.12,
        Math.min(-0.12, game.angle)
      );
    }

    function handlePointerDown(event) {
      event.preventDefault();
      shoot();
    }

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [
    selectedLevel,
    currentColor,
    nextColor,
    score,
    target,
    shoot,
    updateScore,
    onLevelCleared,
  ]);

  return (
    <section className="game-page">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        <span>All levels</span>
      </button>

      <div className="game-heading">
        <span className="section-kicker">BUBBLE BLAST</span>
        <h1>
          Level <span>{selectedLevel}</span>
        </h1>
        <p>Aim, match 3 or more bubbles, and reach the target!</p>
      </div>

      <div className="game-hud">
        <div>
          <small>SCORE</small>
          <strong>{score}</strong>
        </div>

        <div>
          <small>
            <Target size={14} /> TARGET
          </small>
          <strong>{target}</strong>
        </div>

        <div>
          <small>SHOTS LEFT</small>
          <strong>{shots}</strong>
        </div>
      </div>

      <div className="game-board">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Bubble shooter game. Move to aim and tap to shoot."
          style={{
            display: "block",
            width: "100%",
            maxWidth: `${WIDTH}px`,
            height: "auto",
            margin: "0 auto",
            borderRadius: "16px",
            touchAction: "none",
            cursor: "crosshair",
          }}
        />
      </div>

      <div className="game-controls">
        <div className="next-bubble">
          <span>NEXT</span>
          <span
            className={`bubble bubble-${nextColor}`}
            aria-label={`Next bubble: ${nextColor}`}
          />
        </div>

        <button
          className="shoot-button"
          onClick={shoot}
          disabled={shots <= 0 || Boolean(gameRef.current?.projectile)}
        >
          <span>✦</span> Shoot bubble
        </button>

        <button className="restart-button" onClick={resetGame}>
          <RotateCcw size={16} /> Restart
        </button>
      </div>

      {message && (
        <div
          className={`game-message ${
            message.includes("cleared") || message.includes("complete")
              ? "success-message"
              : ""
          }`}
          role="status"
        >
          {message}
        </div>
      )}

      <p className="demo-note">
        Move or touch to aim. Shoot bubbles to match colours.
        {shotsUsed > 0 ? ` Shots taken: ${shotsUsed}.` : ""}
      </p>
    </section>
  );
}
