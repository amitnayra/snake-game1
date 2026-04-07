// Canvas setup
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

canvas.width = 400;
canvas.height = 400;
document.body.style.margin = 0;
document.body.style.background = "#020617";

// Game state
let snake, direction, food, score, speed, gameOver, paused;
let touchStartX = 0, touchStartY = 0;

// Init game
function init() {
  snake = [{ x: 200, y: 200 }];
  direction = { x: 1, y: 0 };
  food = spawnFood();
  score = 0;
  speed = 2;
  gameOver = false;
  paused = false;
}
init();

// Food spawn
function spawnFood() {
  return {
    x: Math.random() * 360 + 20,
    y: Math.random() * 360 + 20,
    t: 0 // animation timer
  };
}

// Game loop
function loop() {
  requestAnimationFrame(loop);
  if (paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    drawGameOver();
    return;
  }

  update();
  draw();
}
requestAnimationFrame(loop);

// Update
function update() {
  let head = {
    x: snake[0].x + direction.x * speed,
    y: snake[0].y + direction.y * speed
  };

  // Wall collision
  if (head.x < 0 || head.x > 400 || head.y < 0 || head.y > 400) {
    gameOver = true;
  }

  // Self collision
  for (let i = 0; i < snake.length; i++) {
    let dx = head.x - snake[i].x;
    let dy = head.y - snake[i].y;
    if (Math.sqrt(dx * dx + dy * dy) < 10) {
      gameOver = true;
    }
  }

  snake.unshift(head);

  // Eat food
  let dx = head.x - food.x;
  let dy = head.y - food.y;
  if (Math.sqrt(dx * dx + dy * dy) < 12) {
    score++;
    speed += 0.2;
    food = spawnFood();
  } else {
    snake.pop();
  }

  food.t += 0.1;
}

// Draw
function draw() {
  // Background grid glow
  ctx.strokeStyle = "#0f172a";
  for (let i = 0; i < 400; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 400);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(400, i);
    ctx.stroke();
  }

  // Draw snake (smooth circles)
  snake.forEach((p, i) => {
    let radius = i === 0 ? 8 : 6;

    let grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 10);
    grad.addColorStop(0, "#4ade80");
    grad.addColorStop(1, "#14532d");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    if (i === 0) {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(p.x - 3, p.y - 3, 1.5, 0, Math.PI * 2);
      ctx.arc(p.x + 3, p.y - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw animated food
  let bounce = Math.sin(food.t) * 3;
  let glow = ctx.createRadialGradient(food.x, food.y, 2, food.x, food.y, 12);
  glow.addColorStop(0, "#f87171");
  glow.addColorStop(1, "#7f1d1d");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(food.x, food.y + bounce, 6, 0, Math.PI * 2);
  ctx.fill();

  // Score
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

// Game over UI
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, 400, 400);

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Game Over", 130, 180);

  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 150, 210);
  ctx.fillText("Tap / Press R to Restart", 90, 240);
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction.y === 0) direction = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && direction.y === 0) direction = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && direction.x === 0) direction = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && direction.x === 0) direction = { x: 1, y: 0 };

  if (e.key === "p") paused = !paused;
  if (e.key === "r" && gameOver) init();
});

// Touch controls (swipe)
canvas.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", (e) => {
  let dx = e.changedTouches[0].clientX - touchStartX;
  let dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction.x === 0) direction = { x: 1, y: 0 };
    else if (dx < 0 && direction.x === 0) direction = { x: -1, y: 0 };
  } else {
    if (dy > 0 && direction.y === 0) direction = { x: 0, y: 1 };
    else if (dy < 0 && direction.y === 0) direction = { x: 0, y: -1 };
  }

  if (gameOver) init();
});
