export class FlappyHeartGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.gameLoop = null;
    this.gravity = 0.5;
    this.lift = -8;
    this.velocity = 0;
    this.position = 250;
    this.obstacles = [];
    this.obstacleSpeed = 4;
    this.obstacleGap = 180;
    this.obstacleFrequency = 90; // frames
    this.frameCount = 0;
    this.score = 0;
    this.isGameOver = false;

    this.init();
  }

  init() {
    this.render();
    this.playerElement = document.getElementById('flappy-heart');
    this.gameArea = document.querySelector('.flappy-game-area');
    this.scoreElement = document.getElementById('flappy-score');

    this.boundHandleClick = this.handleClick.bind(this);
    this.boundGameUpdate = this.gameUpdate.bind(this);

    this.gameArea.addEventListener('click', this.boundHandleClick);
    document.getElementById('skip-btn-flappy').addEventListener('click', () => this.onComplete());

    this.gameLoop = setInterval(this.boundGameUpdate, 1000 / 60);
  }

  cleanup() {
    clearInterval(this.gameLoop);
    this.gameArea.removeEventListener('click', this.boundHandleClick);
  }

  render() {
    this.container.innerHTML = `
      <div class="screen game-screen active">
        <div class="game-header">
          <h2>Stage 4: Flappy Heart</h2>
          <div class="game-stats">
            <div id="flappy-score">Score: 0</div>
          </div>
          <button class="btn skip-btn" id="skip-btn-flappy">Skip Stage</button>
        </div>
        <div class="game-area flappy-game-area">
          <div id="flappy-heart" style="top: 250px;">❤️</div>
          <div class="controls-hint">Tap to fly! Pass 10 obstacles to win.</div>
        </div>
      </div>
    `;
  }

  handleClick() {
    if (this.isGameOver) {
        this.resetGame();
        return;
    }
    this.velocity = this.lift;
  }

  gameUpdate() {
    if (this.isGameOver) return;

    // Player physics
    this.velocity += this.gravity;
    this.position += this.velocity;
    this.playerElement.style.top = `${this.position}px`;

    // Check for collisions with top/bottom
    const gameAreaHeight = this.gameArea.clientHeight;
    if (this.position > gameAreaHeight - 40 || this.position < 0) {
      this.gameOver();
      return;
    }

    // Obstacle management
    this.frameCount++;
    if (this.frameCount % this.obstacleFrequency === 0) {
      this.addObstacle();
    }

    this.updateObstacles();
  }

  addObstacle() {
    const gameAreaHeight = this.gameArea.clientHeight;
    const topHeight = Math.random() * (gameAreaHeight - this.obstacleGap - 100) + 50;

    const topObstacle = document.createElement('div');
    topObstacle.className = 'flappy-obstacle top';
    topObstacle.style.height = `${topHeight}px`;
    this.gameArea.appendChild(topObstacle);

    const bottomObstacle = document.createElement('div');
    bottomObstacle.className = 'flappy-obstacle bottom';
    bottomObstacle.style.height = `${gameAreaHeight - topHeight - this.obstacleGap}px`;
    this.gameArea.appendChild(bottomObstacle);

    this.obstacles.push({ top: topObstacle, bottom: bottomObstacle, x: this.gameArea.clientWidth, passed: false });
  }

  updateObstacles() {
    const playerRect = this.playerElement.getBoundingClientRect();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.obstacleSpeed;

      obs.top.style.left = `${obs.x}px`;
      obs.bottom.style.left = `${obs.x}px`;

      // Collision detection
      const topRect = obs.top.getBoundingClientRect();
      const bottomRect = obs.bottom.getBoundingClientRect();

      if (
        playerRect.right > topRect.left &&
        playerRect.left < topRect.right &&
        (playerRect.top < topRect.bottom || playerRect.bottom > bottomRect.top)
      ) {
        this.gameOver();
        return;
      }

      // Score
      if (!obs.passed && obs.x + topRect.width < playerRect.left) {
        obs.passed = true;
        this.score++;
        this.scoreElement.textContent = `Score: ${this.score}`;
        if (this.score >= 10) {
          this.winGame();
        }
      }

      // Remove off-screen obstacles
      if (obs.x < -60) {
        obs.top.remove();
        obs.bottom.remove();
        this.obstacles.splice(i, 1);
      }
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.container.querySelector('.controls-hint').textContent = 'Game Over! Tap to restart.';
  }

  resetGame() {
    this.isGameOver = false;
    this.position = 250;
    this.velocity = 0;
    this.score = 0;
    this.frameCount = 0;
    this.obstacles.forEach(obs => {
        obs.top.remove();
        obs.bottom.remove();
    });
    this.obstacles = [];
    this.scoreElement.textContent = 'Score: 0';
    this.container.querySelector('.controls-hint').textContent = 'Tap to make the heart fly!';
  }

  winGame() {
    this.isGameOver = true;
    clearInterval(this.gameLoop);
    setTimeout(() => this.onComplete(), 500);
  }
}