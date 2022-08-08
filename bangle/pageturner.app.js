const kb = require('ble_hid_keyboard');
require('FontCopasetic40x58Numeric').add(Graphics);

const STATE = {};

const DEFAULT_STATE = {
  counter: 42,
  duration: 42,
  interval: 0,
  status: 'paused',
};

const Layout = require('Layout');

function resetState() {
  STATE.counter = DEFAULT_STATE.duration;
  STATE.duration = DEFAULT_STATE.duration;
  STATE.interval = DEFAULT_STATE.interval;
  STATE.status = DEFAULT_STATE.status;
}

function init() {
  NRF.setServices(undefined, { hid: kb.report });

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  resetState();
  g.clear();
  updateScreen();
}

function toggleStatus() {
  STATE.status = STATE.status == 'paused' ? 'running' : 'paused';

  if (STATE.status == 'paused') {
    stopCountdown();
  } else {
    restartCountdown();
  }

  updateScreen();
}

function resetCounter() {
  STATE.counter = STATE.duration;
  restartCountdown();
  updateScreen();
}

function prev() {
  resetCounter();
  kb.tap(kb.KEY.LEFT, 0);
}

function next() {
  resetCounter();
  kb.tap(kb.KEY.RIGHT, 0);
}

function countDown() {
  if (STATE.status == 'paused') return;

  STATE.counter--;

  STATE.counter = Math.max(STATE.counter, -1);

  if (STATE.counter == 0) {
    kb.tap(kb.KEY.RIGHT, 0);
  } else if (STATE.counter == -1) {
    resetCounter();
  }

  updateScreen();
}

function updateScreen() {
  g.clear();
  Bangle.drawWidgets();

  layout.status.label = `status: ${STATE.status}`;

  layout.duration.label = `duration: ${STATE.duration}`;

  layout.counter.label = STATE.counter;

  layout.play.label = STATE.status == 'paused' ? 'run' : 'stop';

  layout.render();
}

function stopCountdown() {
  clearInterval(STATE.interval);
}

function restartCountdown() {
  stopCountdown();
  STATE.interval = setInterval(countDown, 1000);
}

function increaseDuration() {
  STATE.duration++;
  STATE.counter++;

  restartCountdown();
  updateScreen();
}

function decreaseDuration() {
  if (STATE.duration < 3) return restartCountdown();

  STATE.duration--;

  if (STATE.counter > 0) STATE.counter--;

  restartCountdown();
  updateScreen();
}

Bangle.on('swipe', (dir) => {
  if (dir == 1) prev();
  else next();
});

const layout = new Layout(
  {
    type: 'v',
    c: [
      { type: 'txt', font: '10%', label: STATE.status, id: 'status' },
      { type: 'txt', font: '15%', label: STATE.status, id: 'duration' },
      { type: 'txt', font: '25%', label: STATE.counter, id: 'counter' },
      {
        type: 'h',
        c: [
          { type: 'btn', font: '10%', label: 'slower', cb: increaseDuration },
          { type: 'btn', font: '10%', label: 'faster', cb: decreaseDuration },
        ],
      },
      {
        type: 'h',
        c: [
          { type: 'btn', font: '10%', label: 'prev', cb: prev },
          { type: 'btn', font: '10%', label: 'next', cb: next },
        ],
      },
    ],
    // lazy: true,
  },
  {
    btns: [{ label: 'play', id: 'play', cb: toggleStatus }],
    // lazy: true,
  }
);

// Bangle.on('tap', toggleStatus);

init();
