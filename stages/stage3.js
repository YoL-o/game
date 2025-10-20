export class MazeGame {
  constructor(container, onComplete) {
    this.container = container
    this.onComplete = onComplete
    this.gridSize = 10
    this.playerPos = { x: 0, y: 0 }
    this.goalPos = { x: 9, y: 9 }
    this.obstacles = []
    this.maze = []

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleTouchStart = this.handleTouchStart.bind(this)
    this.handleTouchEnd = this.handleTouchEnd.bind(this)

    this.init()
  }

  init() {
    this.generateMaze()
    this.spawnObstacles()
    this.render()
    this.setupControls()
    this.startObstacleMovement()
  }

  generateMaze() {
    this.maze = Array(this.gridSize).fill(0).map(() => Array(this.gridSize).fill(0))

    for (let i = 0; i < 15; i++) {
      const x = Math.floor(Math.random() * this.gridSize)
      const y = Math.floor(Math.random() * this.gridSize)

      if ((x !== 0 || y !== 0) && (x !== 9 || y !== 9)) {
        this.maze[y][x] = 1
      }
    }
  }

  spawnObstacles() {
    for (let i = 0; i < 5; i++) {
      let x, y
      do {
        x = Math.floor(Math.random() * (this.gridSize - 2)) + 1
        y = Math.floor(Math.random() * (this.gridSize - 2)) + 1
      } while (
        this.maze[y][x] === 1 ||
        (x === this.playerPos.x && y === this.playerPos.y) ||
        (x === this.goalPos.x && y === this.goalPos.y)
      )

      const direction = Math.floor(Math.random() * 4)
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      this.obstacles.push({ x, y, dx: dirs[direction][0], dy: dirs[direction][1] })
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="screen game-screen active">
        <div class="game-header">
          <h2>Stage 3: Maze of Hearts</h2>
          <div class="game-stats">
            <div>Reach the green heart!</div>
          </div>
          <button class="btn skip-btn" id="skip-btn">Skip Stage</button>
        </div>
        <div class="game-area">
          <div class="maze-container">
            <div class="maze" id="maze"></div>
          </div>
        </div>
        <div class="controls-hint">Guide your heart to the green goal! Use arrow keys or swipe to move.</div>
      </div>
    `

    this.updateMaze()
    document.getElementById('skip-btn').addEventListener('click', () => this.winGame())
  }

  updateMaze() {
    const mazeElement = document.getElementById('maze')
    mazeElement.innerHTML = ''
    mazeElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = document.createElement('div')
        cell.className = 'maze-cell'

        if (this.maze[y][x] === 1) {
          cell.classList.add('wall')
        } else if (x === this.playerPos.x && y === this.playerPos.y) {
          cell.classList.add('player')
        } else if (x === this.goalPos.x && y === this.goalPos.y) {
          cell.classList.add('goal')
        } else if (this.obstacles.some(obs => obs.x === x && obs.y === y)) {
          cell.classList.add('obstacle')
        }

        mazeElement.appendChild(cell)
      }
    }
  }

  setupControls() {
    let touchStartX = 0
    let touchStartY = 0

    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('touchstart', this.handleTouchStart)
    document.addEventListener('touchend', this.handleTouchEnd)
  }

  handleKeyDown(e) {
    e.preventDefault()
    switch (e.key) {
      case 'ArrowUp': this.movePlayer(0, -1); break
      case 'ArrowDown': this.movePlayer(0, 1); break
      case 'ArrowLeft': this.movePlayer(-1, 0); break
      case 'ArrowRight': this.movePlayer(1, 0); break
    }
  }

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
    this.touchStartY = e.touches[0].clientY
  }

  handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchEndX - this.touchStartX
    const deltaY = touchEndY - this.touchStartY

    if (Math.abs(deltaX) > Math.abs(deltaY)) { // Horizontal swipe
      if (deltaX > 30) {
        this.movePlayer(1, 0) // Right
      } else if (deltaX < -30) {
        this.movePlayer(-1, 0) // Left
      }
    } else { // Vertical swipe
      if (deltaY > 30) {
        this.movePlayer(0, 1) // Down
      } else if (deltaY < -30) {
        this.movePlayer(0, -1) // Up
      }
    }
  }

  movePlayer(dx, dy) {
    const newX = this.playerPos.x + dx
    const newY = this.playerPos.y + dy

    if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
      return
    }

    if (this.maze[newY][newX] === 1) {
      return
    }

    if (this.obstacles.some(obs => obs.x === newX && obs.y === newY)) {
      this.resetPlayer()
      return
    }

    this.playerPos.x = newX
    this.playerPos.y = newY

    this.updateMaze()

    if (newX === this.goalPos.x && newY === this.goalPos.y) {
      this.winGame()
    }
  }

  startObstacleMovement() {
    this.obstacleInterval = setInterval(() => {
      this.obstacles.forEach(obs => {
        const newX = obs.x + obs.dx
        const newY = obs.y + obs.dy

        if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize || this.maze[newY][newX] === 1) {
          obs.dx = -obs.dx
          obs.dy = -obs.dy
        } else {
          obs.x = newX
          obs.y = newY
        }

        if (obs.x === this.playerPos.x && obs.y === this.playerPos.y) {
          this.resetPlayer()
          if ('vibrate' in navigator) {
            navigator.vibrate(100)
          }
        }
      })

      this.updateMaze()
    }, 400)
  }

  resetPlayer() {
    this.playerPos = { x: 0, y: 0 }
    this.updateMaze()
  }

  winGame() {
    clearInterval(this.obstacleInterval)
    setTimeout(() => this.onComplete(), 300)
  }

  cleanup() {
    clearInterval(this.obstacleInterval)
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('touchstart', this.handleTouchStart)
    document.removeEventListener('touchend', this.handleTouchEnd)
  }
}
