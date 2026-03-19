const video = document.getElementById("video");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startModal = document.getElementById("startModal");
const gameOverModal = document.getElementById("gameOverModal");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");

canvas.width = 600;
canvas.height = 400;

const playerImg = new Image();
playerImg.src = "player.png";

const enemyImg = new Image();
enemyImg.src = "enemy.png";

let player = {
  x: 300,
  y: 320,
  width: 70,
  height: 70,
};

let targetX = player.x;
let objects = [];
let score = 0;

let gameRunning = false;

function spawnObject() {
  if (!gameRunning) return;

  objects.push({
    x: Math.random() * (canvas.width - 40),
    y: -40,
    size: 40,
    speed: 3 + Math.random() * 2,
  });
}

setInterval(spawnObject, 1000);

function collision(a, b) {
  const padding = 20; //ajusta el hitbox

  return (
    a.x + padding < b.x + b.size &&
    a.x + a.width - padding > b.x &&
    a.y < b.y + b.size &&
    a.y + a.height > b.y
  );
}

function gameOver() {
  gameRunning = false;

  finalScore.innerText = "Score: " + score;

  gameOverModal.style.display = "flex";
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    player.x += (targetX - player.x) * 0.25;

    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  }

  if (playerImg.complete) {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  }

  objects.forEach((o, index) => {
    if (gameRunning) o.y += o.speed;

    if (enemyImg.complete) {
      ctx.drawImage(enemyImg, o.x, o.y, o.size, o.size);
    }

    if (gameRunning && collision(player, o)) {
      gameOver();
    }

    if (o.y > canvas.height) {
      objects.splice(index, 1);
      score++;
    }
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

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
