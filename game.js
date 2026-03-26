const video = document.getElementById("video");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const gameContainer = document.querySelector(".game-container");

const startModal = document.getElementById("startModal");
const gameOverModal = document.getElementById("gameOverModal");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const winnerText = document.querySelector(".winner");

let timeLeft = 30;

const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
timerEl.innerText = 'TIME: ' + timeLeft;

// IMAGENES
const playerImg = new Image();
playerImg.src = "./assets/player.png";

const enemySources = ["./assets/item1.png", "./assets/item2.png", "./assets/item3.png", "./assets/item4.png", "./assets/item5.png"];
const enemyImages = [];

enemySources.forEach(src => {
  const img = new Image();
  img.src = src;
  enemyImages.push(img);
});

// PLAYER
let player = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

let targetX = player.x;
let objects = [];
let score = 0;

let gameRunning = false;

function resizeGame() {
  canvas.width = gameContainer.clientWidth;
  canvas.height = gameContainer.clientHeight;

  player.width = canvas.width * 0.09;
  player.height = player.width * 0.93;
  player.y = canvas.height - player.height - canvas.height * 0.08;

  if (!gameRunning) {
    player.x = (canvas.width - player.width) / 2;
    targetX = player.x;
  } else {
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    targetX = Math.max(0, Math.min(canvas.width - player.width, targetX));
  }
}

resizeGame();
window.addEventListener("resize", resizeGame);

function spawnObject() {
  if (!gameRunning) return;

  const img = enemyImages[Math.floor(Math.random() * enemyImages.length)];
  const size = canvas.width * 0.05;

  objects.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    speed: canvas.height * (0.004 + Math.random() * 0.0025),
    img
  });
}

setInterval(spawnObject, 1000);

// ============= TIMER ==============
setInterval(() => {

  if (!gameRunning) return;

  timeLeft--;

  timerEl.innerText = 'TIME: ' + timeLeft

  if (timeLeft <= 0) {
    gameOver();
  }

}, 1000);

// ================= COLLISION =================
function collision(a, b) {
  const padding = 20; //ajusta el hitbox

  return (
    a.x + padding < b.x + b.size &&
    a.x + a.width - padding > b.x &&
    a.y < b.y + b.size &&
    a.y + a.height > b.y
  );
}

// ================= GAME OVER =================
function gameOver() {
  gameRunning = false;

  finalScore.innerText = "FLAVOR: " + score;
  winnerText.innerText = score > 15 ? "WINNER!" : "TRY AGAIN";

  gameOverModal.style.display = "flex";
}

// ================= LOOP =================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {

    // movimiento suave
    player.x += (targetX - player.x) * 0.25;

    // límite pantalla
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  }

  // jugador
  if (playerImg.complete) {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  }

  // enemigos
  objects.forEach((o, index) => {

    if (gameRunning) o.y += o.speed;

    if (o.img.complete) {
      ctx.drawImage(o.img, o.x, o.y, o.size, o.size);
    }

    if (gameRunning && collision(player, o)) {
      gameOver();
    }

    if (o.y > canvas.height) {
      objects.splice(index, 1);
      score++;
    }

  });

  scoreEl.innerText = "Flavor: " +  score;

  requestAnimationFrame(update);
}

update();

startBtn.onclick = () => {
  startModal.style.display = "none";

  gameRunning = true;
};

restartBtn.onclick = () => {
  location.reload();
};

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
  },
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

faceMesh.onResults((results) => {
  if (results.multiFaceLandmarks.length > 0) {
    const nose = results.multiFaceLandmarks[0][1];

    const x = 1 - nose.x;

    targetX = x * canvas.width;
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 320,
  height: 240,
});

camera.start();
