const state = {
  app: 'sleeping',
  red: false,
  green: false,
  blue: false,
  timeout: 700,
  button: 'up',
  downTime: 0,
  direction: 'down',
  settingDirection: false,
  toggleTimeout: null,
  toggleRedTimeout: null,
  turnPageTimeout: null,
  counter: 0,
  lastTurn: 0
}

const $ = document.querySelector.bind(document)
const $button = $('.button')
const $ledRed = $('.led.red')
const $ledGreen = $('.led.green')
const $ledBlue = $('.led.blue')
const $state = $('#state')

setInterval(() => {
  $state.innerText = `app: ${state.app}; turning page every ${state.timeout * 20}ms; setting direction: ${state.settingDirection}; next direction: ${state.direction}`
}, 100)

$button.addEventListener('mousedown', (e) => {
  state.button = 'down'
  const diff = Date.now() - state.downTime
  state.downTime = Date.now()

  if (state.app == 'running' && diff < 350) {
    console.log('caught')
    clearTimeout(state.turnPageTimeout)

    state.toggleTimeout = setInterval((e) => {
      state.timeout = state.timeout + (state.direction == 'down' ? -25 : 25)
      state.timeout = Math.max(state.timeout, 300)
    }, 250)
    state.settingDirection = true
    clearTimeout(state.toggleRedTimeout)
    state.blue = false
    toggleBlue()
  }
  else if (diff > 350) {
    state.toggleTimeout = setTimeout((e) => {
      if (state.app == 'sleeping') {
        state.app = 'running'

        toggleGreen()
        console.log('running app')
        state.lastTurn = Date.now()

        setTimeout(toggleGreen, 2000)

      }
      else if (state.app == 'running') {
        state.app = 'sleeping'

        toggleRed()
        console.log('sleeping app')
        setTimeout(toggleRed, 2000)
      }

      state.button = 'up'
    }, 3000)
  }
})

$button.addEventListener('mouseup', (e) => {
  state.button = 'up'
  if (state.settingDirection) {
    state.settingDirection = false
    state.direction = state.direction == 'down' ? 'up' : 'down'
    state.blue = false
    $ledBlue.classList.toggle('on', false)
  } else if (state.app == 'running' && Date.now() - state.downTime < 350) {
    state.turnPageTimeout = setTimeout(() => {
      toggleGreen()
      console.log('turning page after', Date.now() - state.lastTurn, 'ms')
      state.lastTurn = Date.now()
      state.counter = 0

      setTimeout(toggleGreen, state.timeout)
    }, 350)
  }
  clearTimeout(state.toggleTimeout)
  clearInterval(state.toggleTimeout)
})

const toggleBlue = () => {
  if (state.app == 'sleeping') return state.toggleRedTimeout = setTimeout(toggleBlue, state.timeout)

  if (!state.settingDirection) {
    state.counter = ++state.counter % 20

    if (state.counter == 19) {
      toggleGreen()
      console.log('turning page after', Date.now() - state.lastTurn, 'ms')
      state.lastTurn = Date.now()

      setTimeout(toggleGreen, state.timeout)
    }
  }

  state.blue = !state.blue

  if (state.settingDirection)
    $ledBlue.classList.toggle('on', state.blue)

  state.toggleRedTimeout = setTimeout(toggleBlue, state.timeout)
}

const toggleRed = () => {
  state.red = !state.red

  $ledRed.classList.toggle('on', state.red)
}

const toggleGreen = () => {
  if (state.app == 'sleeping') return

  state.green = !state.green

  $ledGreen.classList.toggle('on', state.green)
}

toggleBlue()
toggleGreen()
