export class HeartCatchGame {
  constructor(container, onComplete) {
    this.container = container
    this.onComplete = onComplete
    this.score = 0
    this.timeLeft = 30
    this.targetScore = 35
    this.fallingHearts = []
    this.gameInterval = null
    this.timerInterval = null
    this.basketX = 50
    this.gameArea = null
    this.basket = null

    // Bind event handlers to `this`
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchMove = this.handleTouchMove.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.init()
  }

  init() {
    this.render()
    this.setupControls()
    this.startGame()
  }

  render() {
    this.container.innerHTML = `
      <div class="screen game-screen active">
        <div class="game-header">
          <h2>Stage 1: Catch the Falling Hearts</h2>
          <div class="game-stats">
            <div>Score: <span id="score">0</span>/${this.targetScore}</div>
            <div>Time: <span id="timer">${this.timeLeft}</span>s</div>
          </div>
          <button class="btn skip-btn" id="skip-btn">Skip Stage</button>
        </div>
        <div class="game-area" id="game-area">
          <div class="basket" id="basket">🧺</div>
        </div>
        <div class="controls-hint">Move the basket to catch ${this.targetScore} hearts before time runs out!</div>
      </div>
    `

    this.gameArea = document.getElementById('game-area')
    this.basket = document.getElementById('basket')
    document.getElementById('skip-btn').addEventListener('click', () => this.onComplete())
    this.updateBasketPosition()
  }

  setupControls() {
    let touchStartX = 0
    let isMoving = false

    document.addEventListener('keydown', this.handleKeyDown)
    this.gameArea.addEventListener('touchstart', this.handleTouchStart)
    this.gameArea.addEventListener('touchmove', this.handleTouchMove)
    this.gameArea.addEventListener('touchend', this.handleTouchEnd)
    this.gameArea.addEventListener('mousemove', this.handleMouseMove)
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      this.basketX = Math.max(0, this.basketX - 5)
      this.updateBasketPosition()
    } else if (e.key === 'ArrowRight') {
      this.basketX = Math.min(100, this.basketX + 5)
      this.updateBasketPosition()
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
    this.isMoving = true
  }

  handleTouchMove(e) {
    if (!this.isMoving) return
    e.preventDefault()
    const rect = this.gameArea.getBoundingClientRect()
    const touchX = e.touches[0].clientX - rect.left
    this.basketX = Math.max(0, Math.min(100, (touchX / rect.width) * 100))
    this.updateBasketPosition()
  }

  handleTouchEnd() { this.isMoving = false }

  handleMouseMove(e) {
    const rect = this.gameArea.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    this.basketX = Math.max(0, Math.min(100, (mouseX / rect.width) * 100))
    this.updateBasketPosition()
  }

  updateBasketPosition() {
    if (this.basket) {
      this.basket.style.transform = `translateX(calc(${this.basketX}vw - 40px))`
      this.basket.style.left = '0'
    }
  }

  startGame() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--
      document.getElementById('timer').textContent = this.timeLeft

      if (this.timeLeft <= 0) {
        this.endGame()
      }
    }, 1000)

    this.gameInterval = setInterval(() => {
      this.spawnHeart()
    }, 600)
  }

  spawnHeart() {
    const heart = document.createElement('div')
    heart.className = 'falling-heart'
    heart.textContent = '❤️'
    heart.style.left = Math.random() * 90 + '%'
    heart.style.top = '-30px'

    this.gameArea.appendChild(heart)

    const heartData = {
      element: heart,
      x: parseFloat(heart.style.left),
      y: -30,
      speed: Math.random() * 3 + 3
    }

    this.fallingHearts.push(heartData)

    this.animateHeart(heartData)
  }

  animateHeart(heartData) {
    const animate = () => {
      if (!this.gameArea || !this.gameArea.contains(heartData.element)) {
        return
      }

      heartData.y += heartData.speed
      heartData.element.style.top = heartData.y + 'px'

      const basketRect = this.basket.getBoundingClientRect()
      const heartRect = heartData.element.getBoundingClientRect()

      if (this.checkCollision(basketRect, heartRect)) {
        this.catchHeart(heartData)
        return
      }

      if (heartData.y < window.innerHeight) {
        requestAnimationFrame(animate)
      } else {
        this.removeHeart(heartData)
      }
    }

    requestAnimationFrame(animate)
  }

  checkCollision(rect1, rect2) {
    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom)
  }

  catchHeart(heartData) {
    this.score++
    document.getElementById('score').textContent = this.score
    this.removeHeart(heartData)

    if (this.score >= this.targetScore) {
      this.endGame(true)
    }
  }

  removeHeart(heartData) {
    if (heartData.element && heartData.element.parentNode) {
      heartData.element.remove()
    }
    const index = this.fallingHearts.indexOf(heartData)
    if (index > -1) {
      this.fallingHearts.splice(index, 1)
    }
  }

  endGame(won = false) {
    clearInterval(this.gameInterval)
    clearInterval(this.timerInterval)

    this.fallingHearts.forEach(heart => {
      if (heart.element && heart.element.parentNode) {
        heart.element.remove()
      }
    })

    if (won) {
      setTimeout(() => this.onComplete(), 500)
    } else {
      this.container.innerHTML = `
        <div class="screen reward-screen active">
          <h2>Time's Up!</h2>
          <p>You caught ${this.score} hearts, but needed ${this.targetScore}.</p>
          <button class="btn" id="retry-btn">Try Again</button>
        </div>
      `

      document.getElementById('retry-btn').addEventListener('click', () => {
        this.score = 0
        this.timeLeft = 30
        this.fallingHearts = []
        this.init()
      })
    }
  }

  cleanup() {
    this.endGame()
    document.removeEventListener('keydown', this.handleKeyDown)
    this.gameArea.removeEventListener('touchstart', this.handleTouchStart)
    this.gameArea.removeEventListener('touchmove', this.handleTouchMove)
    this.gameArea.removeEventListener('touchend', this.handleTouchEnd)
    this.gameArea.removeEventListener('mousemove', this.handleMouseMove)
  }
}
