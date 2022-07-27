const kb = require('ble_hid_keyboard')
require('FontCopasetic40x58Numeric').add(Graphics)

const STATE = {}

const DEFAULT_STATE = {
  counter: 42,
  duration: 42,
  interval: 0,
  status: 'paused',
}

function resetState() {
  STATE.counter = DEFAULT_STATE.duration
  STATE.duration = DEFAULT_STATE.duration
  STATE.interval = DEFAULT_STATE.interval
  STATE.status = DEFAULT_STATE.status
}

function init() {
  NRF.setServices(undefined, { hid: kb.report })

  Bangle.loadWidgets()
  Bangle.drawWidgets()

  Bangle.setLCDMode('doublebuffered')

  resetState()
  updateScreen()
}

function toggleStatus() {
  STATE.status = STATE.status == 'paused' ? 'running' : 'paused'

  if (STATE.status == 'paused') {
    stopCountdown()
  } else {
    restartCountdown()
  }

  updateScreen()
}

function resetCounter() {
  STATE.counter = STATE.duration
  restartCountdown()
  updateScreen()
}

function prev() {
  resetCounter()
  kb.tap(kb.KEY.LEFT, 0)
}

function next() {
  resetCounter()
  kb.tap(kb.KEY.RIGHT, 0)
}

function countDown() {
  if (STATE.status == 'paused') return

  STATE.counter--

  STATE.counter = Math.max(STATE.counter, -1)

  if (STATE.counter == 0) {
    kb.tap(kb.KEY.RIGHT, 0)
  } else if (STATE.counter == -1) {
    resetCounter()
  }

  updateScreen()
}

function updateScreen() {
  g.clearRect(0, 0, 240, 160)
  Bangle.drawWidgets()

  g.setColor(1, 1, 1)

  g.setFontAlign(0, 0)
  g.setFont('Vector', 20)
  g.drawString('status: ' + STATE.status, g.getWidth() / 2, 40)

  g.setFontAlign(0, 0)
  g.setFont('Vector', 30)
  g.drawString('duration: ' + STATE.duration, g.getWidth() / 2, g.getHeight() / 2 - 8)

  g.setFontAlign(0, 0)
  g.setFont('Copasetic40x58Numeric', 1.2)
  g.drawString(STATE.counter, g.getWidth() / 2, g.getHeight() / 2 + 50)

  g.flip()
}

function stopCountdown() {
  clearInterval(STATE.interval)
}

function restartCountdown() {
  stopCountdown()
  STATE.interval = setInterval(countDown, 1000)
}

function increaseDuration() {
  STATE.duration++
  STATE.counter++

  restartCountdown()
  updateScreen()
}

function decreaseDuration() {
  if (STATE.duration < 3) return restartCountdown()

  STATE.duration--

  if (STATE.counter > 0) STATE.counter--

  restartCountdown()
  updateScreen()
}

setWatch(increaseDuration, BTN1, { repeat: true })
setWatch(decreaseDuration, BTN3, { repeat: true })
setWatch(toggleStatus, BTN2, { repeat: true })

Bangle.on('swipe', (dir) => {
  if (dir == 1) prev()
  else next()
})

Bangle.on('touch', function (button) {
  switch (button) {
    case 1:
      prev()
      break
    case 2:
      next()
      break
    case 3:
      toggleStatus()
      break
  }
})

init()

// setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
