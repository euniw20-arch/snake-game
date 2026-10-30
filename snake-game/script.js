const BOARD_SIZE = 20;

const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const gameResultEl = document.getElementById('gameResult');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

let snake, direction, nextDirection, food, score, highScore;
let gameOver, gameRunning, gamePaused;
let gameLoop;

function initGame() {
    snake = [
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    gameRunning = false;
    gamePaused = false;
    scoreEl.textContent = '0';
    finalScoreEl.textContent = '0';
    highScore = Number(localStorage.getItem('snakeHighScore') || 0);
    highScoreEl.textContent = highScore;
    startOverlay.classList.remove('hidden');
    gameOverOverlay.classList.add('hidden');
    placeFood();
}

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, 150);
}

function resetGame() {
    clearInterval(gameLoop);
    initGame();
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    startGame();
}

startBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', resetGame);

function placeFood() {
    const occupied = new Set(snake.map(s => s.x + ',' + s.y));
    const free = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (!occupied.has(x + ',' + y)) free.push({ x, y });
        }
    }
    if (free.length === 0) {
        gameOver = true;
        gameRunning = false;
        clearInterval(gameLoop);
        finalScoreEl.textContent = score;
        gameResultEl.textContent = '🏆 완주했어요! 보드 전부를 먹었어요!';
        gameOverOverlay.classList.remove('hidden');
        return;
    }
    food = free[Math.floor(Math.random() * free.length)];
    render();
}

function gameStep() {
    if (gameOver || gamePaused || !gameRunning) return;
    direction = { ...nextDirection };
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    const hitWall = head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE;
    const hitSelf = snake.some(s => s.x === head.x && s.y === head.y);
    if (hitWall || hitSelf) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, Math.max(70, 150 - Math.floor(score / 10) * 5));
        placeFood();
    } else {
        snake.pop();
    }

    render();
}

function endGame() {
    gameOver = true;
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');
}

function render() {
    board.innerHTML = '';
    const foodEl = document.createElement('div');
    foodEl.className = 'food';
    foodEl.style.gridRow = food.y + 1;
    foodEl.style.gridColumn = food.x + 1;
    board.appendChild(foodEl);

    snake.forEach((seg, i) => {
        const segEl = document.createElement('div');
        segEl.className = 'snake-segment' + (i === 0 ? ' snake-head' : '');
        segEl.style.gridRow = seg.y + 1;
        segEl.style.gridColumn = seg.x + 1;
        board.appendChild(segEl);
    });
}

pauseBtn.addEventListener('click', () => {
    if (!gameRunning || gameOver) return;
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? '다시 시작' : '일시정지';
});

resetBtn.addEventListener('click', resetGame);

document.addEventListener('keydown', (e) => {
    const k = e.key;
    let newDir = null;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') newDir = { x: 0, y: -1 };
    else if (k === 'ArrowDown' || k === 's' || k === 'S') newDir = { x: 0, y: 1 };
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') newDir = { x: -1, y: 0 };
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') newDir = { x: 1, y: 0 };
    else return;

    e.preventDefault();
    if (!gameRunning || gameOver || gamePaused) return;
    const isReverse = newDir.x === -direction.x && newDir.y === -direction.y;
    if (isReverse) return;
    nextDirection = newDir;
});

initGame();
