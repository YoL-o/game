export class MemoryGame {
  constructor(container, onComplete) {
    this.container = container
    this.onComplete = onComplete
    this.cards = ['❤️', '🎂', '⭐', '🌹', '🎁', '💕']
    this.gameCards = [...this.cards, ...this.cards]
    this.shuffledCards = this.shuffle(this.gameCards)
    this.flippedCards = []
    this.matchedPairs = 0
    this.canFlip = true

    this.init()
  }

  init() {
    this.render()
    this.setupCards()
  }

  shuffle(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  render() {
    this.container.innerHTML = `
      <div class="screen game-screen active">
        <div class="game-header">
          <h2>Stage 2: Memory Match</h2>
          <div class="game-stats">
            <div>Pairs: <span id="pairs">0</span>/6</div>
          </div>
          <button class="btn skip-btn" id="skip-btn">Skip Stage</button>
        </div>
        <div class="game-area">
          <div class="memory-grid" id="memory-grid"></div>
        </div>
        <div class="controls-hint">Match all the pairs!</div>
      </div>
    `

    const grid = document.getElementById('memory-grid')

    this.shuffledCards.forEach((symbol, index) => {
      const card = document.createElement('div')
      card.className = 'memory-card'
      card.dataset.index = index
      card.dataset.symbol = symbol

      card.innerHTML = `
        <div class="card-front">?</div>
        <div class="card-back">${symbol}</div>
      `

      grid.appendChild(card)
    })
  }

  // In setupCards, add the event listener for the skip button

  setupCards() {
    const cards = document.querySelectorAll('.memory-card')

    cards.forEach(card => {
      card.addEventListener('click', () => this.flipCard(card))
    })

    document.getElementById('skip-btn').addEventListener('click', () => this.onComplete())
  }

  flipCard(card) {
    if (!this.canFlip ||
        card.classList.contains('flipped') ||
        card.classList.contains('matched') ||
        this.flippedCards.length >= 2) {
      return
    }

    card.classList.add('flipped')
    this.flippedCards.push(card)

    if (this.flippedCards.length === 2) {
      this.canFlip = false
      setTimeout(() => this.checkMatch(), 800)
    }
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards
    const symbol1 = card1.dataset.symbol
    const symbol2 = card2.dataset.symbol

    if (symbol1 === symbol2) {
      card1.classList.add('matched')
      card2.classList.add('matched')
      this.matchedPairs++
      document.getElementById('pairs').textContent = this.matchedPairs

      if (this.matchedPairs === 6) {
        setTimeout(() => this.onComplete(), 500)
      }
    } else {
      card1.classList.remove('flipped')
      card2.classList.remove('flipped')
    }

    this.flippedCards = []
    this.canFlip = true
  }
}
