import { HeartCatchGame } from './stages/stage1.js'
import { MemoryGame } from './stages/stage2.js'
import { MazeGame } from './stages/stage3.js'
import { FlappyHeartGame } from './stages/stage4.js'
import { WhackAHearGame } from './stages/stage5.js'

export class Game {
  constructor(container) {
    this.container = container
    this.currentStageInstance = null
    this.completedStages = []
  }

  init() {
    this.showWelcomeScreen()
  }

  showWelcomeScreen() {
    this.container.innerHTML = `
      <div class="screen welcome-screen active">
        <h1>Hey Debby!</h1>
        <p>I made you something special...</p>
        <p>Complete 5 fun challenges to unlock your surprise!</p>
        <button class="btn" id="start-btn">Let's Go!</button>
      </div>
    `

    document.getElementById('start-btn').addEventListener('click', () => {
      this.startStage(1)
    })
  }

  startStage(stage) {
    // Clean up the previous stage's listeners and intervals
    if (this.currentStageInstance && this.currentStageInstance.cleanup) {
      this.currentStageInstance.cleanup()
    }

    switch (stage) {
      case 1:
        this.currentStageInstance = new HeartCatchGame(this.container, () => this.onStageComplete(1))
        break
      case 2:
        this.currentStageInstance = new MemoryGame(this.container, () => this.onStageComplete(2))
        break
      case 3:
        this.currentStageInstance = new MazeGame(this.container, () => this.onStageComplete(3))
        break
      case 4:
        this.currentStageInstance = new FlappyHeartGame(this.container, () => this.onStageComplete(4))
        break
      case 5:
        this.currentStageInstance = new WhackAHearGame(this.container, () => this.onStageComplete(5))
        break
    }
  }

  onStageComplete(stage) {
    this.completedStages.push(stage)
    this.showReward(stage)
  }

  showReward(stage) {
    const rewards = {
      1: {
        title: 'Stage 1 Complete!',
        message: 'Nice catching skills! Ready for the next challenge?',
        voiceMessage: 'Okay okay, I see you catching hearts Who\'s?'
      },
      2: {
        title: 'Stage 2 Complete!',
        message: 'Memory Test!',
        voiceMessage: 'It\'s short so you wont forget hehehe'
      },
      3: {
        title: 'Stage 3 Complete!',
        message: 'You made it through the maze! Keep going...',
        voiceMessage: 'Good job, you did it! 💪'
      },
      4: {
        title: 'Stage 4 Complete!',
        message: 'Flappy Birdsss',
        voiceMessage: 'Fly high'
      },
      5: {
        title: 'All Stages Complete!',
        message: 'You did it! Time for your final surprise...',
        voiceMessage: 'You made it through everything! Here\'s what I wanted to say...'
      }
    }

    const reward = rewards[stage]

    this.container.innerHTML = `
      <div class="screen reward-screen active">
        <h2>${reward.title}</h2>
        <p>${reward.message}</p>
        <div class="voice-player">
          <p style="margin-bottom: 15px;">${reward.voiceMessage}</p>
        </div>
        <button class="btn" id="continue-btn">
          ${stage < 5 ? 'Next Challenge' : 'See Final Surprise'}
        </button>
      </div>
    `

    document.getElementById('continue-btn').addEventListener('click', () => {
      if (stage < 5) {
        this.startStage(stage + 1)
      } else {
        this.showFinale()
      }
    })
  }

  showFinale() {
    this.container.innerHTML = `
      <div class="screen finale-screen active">
        <div class="note-container">
          <h2>For Debby</h2>
          <p>Hey beautiful,</p>
          <p>I know this might seem like just a silly little game, but I wanted to do something special for you. Something that would make you smile.</p>
          <p>You've been on my mind so much lately, and I just had to let you know. The way you light up when you laugh, the way you make everything feel a little bit better... it's something I don't take for granted.</p>
          <p>These five challenges? They're just a tiny reflection of how much effort I'd put in just to see you happy. You're worth every line of code, every little detail, every moment.</p>
          <p>Thank you for being you. Thank you for being in my life. I hope this made you smile even half as much as you make me smile every day.</p>
          <p class="note-signature">Always thinking of you ❤️</p>
        </div>
      </div>
    `
  }
}
