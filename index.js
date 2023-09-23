// 遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

// 花色
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const utility = {
  getRandomNumberArray(count) {
    //建立內含0-51的陣列
    const number = Array.from(Array(count).keys())
    // 洗牌
    for (let index = number.length - 1; index > 0; index --) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
      // destructuring assignment 
      // example
      // temp = number[index]
      // number[index] = number[randomIndex]
      // number[randomIndex] = temp
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

// MVC
const controller = {
  // 初始遊戲狀態
  currentState: GAME_STATE.FirstCardAwaits,
  // 建立牌組
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if(!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        // 翻牌
        view.flipCards(card)
        // 丟進站存牌組
        model.revealedCards.push(card)
        // 更改遊戲狀態
        this.currentState = GAME_STATE.SecondCardAwaits
        return
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(() => {
            view.resetCards()
          }, 1000)
        }
        return
    }
  }
}

const model = {
  score: 0,
  triedTimes: 0,
  // 暫存牌組
  revealedCards: [],
  // 比對暫存牌組數值
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  }
}

const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}" alt="">
        <p>${number}</p>
    `
  },
  flipCards(...cards) {
    cards.map(card => {console.log(card)})
    cards.map(card => {
      // 背面=>回傳正片
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 正面=>回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  // 配對成功後，新增class
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  // 重置牌
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong'), {once: true}
      })
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// view.displayCards() 由 controller 取代
controller.generateCards()

// nodeList(array-like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})