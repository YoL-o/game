export class WhackAHearGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.gridSize = 3; // 3x3 grid
    this.holes = [];
    this.score = 0;
    this.lives = 3;
    this.timeLeft = 30; // seconds
    this.gameInterval = null;
    this.timerInterval = null;
    this.heartPopInterval = null;
    this.isGameOver = false;
    this.heartDuration = 1000; // ms heart stays visible
    this.popFrequency = 800; // ms between heart pops

    this.init();
  }

  init() {
    this.render();
    this.setupGame();
    this.startGame();
  }

  cleanup() {
    clearInterval(this.gameInterval);
    clearInterval(this.timerInterval);
    clearInterval(this.heartPopInterval);
    this.holes.forEach(hole => hole.removeEventListener('click', this.boundHandleClick));
  }

  render() {
    this.container.innerHTML = `
      <div class="screen game-screen active">
        <div class="game-header">
          <h2>Stage 5: Whack-a-Heart</h2>
          <div class="game-stats">
            <div>Score: <span id="whack-score">0</span></div>
            <div>Lives: <span id="whack-lives">3</span></div>
            <div>Time: <span id="whack-time">30</span>s</div>
          </div>
          <button class="btn skip-btn" id="skip-btn">Skip Stage</button>
        </div>
        <div class="game-area">
          <div class="whack-grid" id="whack-grid"></div>
        </div>
        <div class="controls-hint" id="whack-hint">Tap 10 hearts in 30 seconds to win! Don't miss.</div>
        <div id="whack-game-over-controls" style="display: none; margin-top: 20px;">
            <button class="btn" id="retry-btn-whack">Try Again</button>
        </div>
      </div>
    `;
    document.getElementById('skip-btn').addEventListener('click', () => this.onComplete());
  }

  setupGame() {
    this.gridElement = document.getElementById('whack-grid');
    this.scoreElement = document.getElementById('whack-score');
    this.livesElement = document.getElementById('whack-lives');
    this.timeElement = document.getElementById('whack-time');
    this.hintElement = document.getElementById('whack-hint');

    this.retryButton = document.getElementById('retry-btn-whack');
    this.gridElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const hole = document.createElement('div');
      hole.className = 'whack-hole';
      hole.dataset.index = i;
      hole.addEventListener('click', this.boundHandleClick.bind(this));
      this.gridElement.appendChild(hole);
      this.holes.push(hole);
    }

    this.retryButton.addEventListener('click', () => this.startGame());
  }

  startGame() {
    this.score = 0;
    this.lives = 3;
    this.timeLeft = 30;
    this.isGameOver = false;
    this.updateDisplay();
    this.hintElement.textContent = 'Tap 10 hearts in 30 seconds to win! Don\'t miss.';
    document.getElementById('whack-game-over-controls').style.display = 'none';
    this.holes.forEach(hole => hole.classList.remove('active'));

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) {
        this.endGame(this.score >= 10); // Win if score >= 10 within time
      }
    }, 1000);

    this.heartPopInterval = setInterval(() => {
      if (this.isGameOver) return;
      this.popHeart();
    }, this.popFrequency);
  }

  popHeart() {
    const activeHoles = this.holes.filter(hole => hole.classList.contains('active'));
    activeHoles.forEach(hole => {
      hole.classList.remove('active');
      hole.innerHTML = '';
      this.loseLife(); // Lose a life for a heart that disappeared without being tapped
    });

    if (this.isGameOver) return;

    const availableHoles = this.holes.filter(hole => !hole.classList.contains('active'));
    if (availableHoles.length === 0) return;

    const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    randomHole.classList.add('active');
    randomHole.innerHTML = '❤️';

    setTimeout(() => {
      if (randomHole.classList.contains('active')) {
        randomHole.classList.remove('active');
        randomHole.innerHTML = '';
        this.loseLife();
      }
    }, this.heartDuration);
  }

  boundHandleClick(event) {
    if (this.isGameOver) return;

    const hole = event.target;
    if (hole.classList.contains('active')) {
      this.score++;
      hole.classList.remove('active');
      hole.innerHTML = '';
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else {
      this.loseLife(); // Tapped an empty hole
    }
    this.updateDisplay();
  }

  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.endGame(false);
    }
    this.updateDisplay();
  }

  updateDisplay() {
    this.scoreElement.textContent = this.score;
    this.livesElement.textContent = this.lives;
    this.timeElement.textContent = this.timeLeft;
  }

  endGame(won) {
    this.isGameOver = true;
    clearInterval(this.timerInterval);
    clearInterval(this.heartPopInterval);

    this.holes.forEach(hole => {
      hole.classList.remove('active');
      hole.innerHTML = '';
    });

    if (won) {
      this.hintElement.textContent = 'You caught enough hearts! Stage Complete!';
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => this.onComplete(), 1000);
    } else {
      this.hintElement.textContent = 'Game Over!';
      document.getElementById('whack-game-over-controls').style.display = 'block';
    }
  }
}
