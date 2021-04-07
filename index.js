var kb = require('ble_hid_keyboard');
NRF.setServices(undefined, { hid: kb.report });

const state = {};

const defaultState = {
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
  lastTurn: 0,
};

function resetState() {
  state.toggleTimeout && clearInterval(state.toggleTimeout);
  state.turnPageTimeout && clearTimeout(state.turnPageTimeout);

  state.app = defaultState.app;
  state.red = defaultState.red;
  state.green = defaultState.green;
  state.blue = defaultState.blue;
  state.timeout = defaultState.timeout;
  state.button = defaultState.button;
  state.downTime = defaultState.downTime;
  state.direction = defaultState.direction;
  state.settingDirection = defaultState.settingDirection;
  state.toggleTimeout = defaultState.toggleTimeout;
  state.toggleRedTimeout = defaultState.toggleRedTimeout;
  state.turnPageTimeout = defaultState.turnPageTimeout;
  state.counter = defaultState.counter;
  state.lastTurn = defaultState.lastTurn;
}

setWatch(
  (e) => {
    console.log('down');
    state.button = 'down';
    const diff = Date.now() - state.downTime;
    state.downTime = Date.now();

    if (state.app == 'running' && diff < 350) {
      console.log('caught');
      clearTimeout(state.turnPageTimeout);

      state.toggleTimeout = setInterval((e) => {
        state.timeout = state.timeout + (state.direction == 'down' ? -25 : 25);
        state.timeout = Math.max(state.timeout, 300);
      }, 250);
      state.settingDirection = true;
      clearTimeout(state.toggleRedTimeout);
      state.blue = false;
      toggleBlue();
    } else if (diff > 350) {
      state.toggleTimeout = setTimeout((e) => {
        if (state.app == 'sleeping') {
          state.app = 'running';

          toggleGreen();
          console.log('running app');
          state.lastTurn = Date.now();

          setTimeout(toggleGreen, 2000);
        } else if (state.app == 'running') {
          state.app = 'sleeping';

          toggleRed();
          console.log('sleeping app');
          setTimeout(toggleRed, 2000);
        }

        state.button = 'up';
      }, 3000);
    }
  },
  BTN,
  { edge: 'rising', repeat: true, debounce: 50 }
);

function turnPage() {
  toggleGreen();
  kb.tap(kb.KEY.RIGHT, 0);
  console.log('turning page after', Date.now() - state.lastTurn, 'ms');
  state.lastTurn = Date.now();
  state.counter = 0;

  setTimeout(toggleGreen, state.timeout);
}

setWatch(
  (e) => {
    console.log('up');
    state.button = 'up';
    if (state.settingDirection) {
      state.settingDirection = false;
      state.direction = state.direction == 'down' ? 'up' : 'down';
      state.blue = false;

      LED3.write(0);
    } else if (state.app == 'running' && Date.now() - state.downTime < 350) {
      state.turnPageTimeout = setTimeout(turnPage, 350);
    }
    clearTimeout(state.toggleTimeout);
    clearInterval(state.toggleTimeout);
  },
  BTN,
  { edge: 'falling', repeat: true, debounce: 50 }
);

const toggleBlue = () => {
  if (state.app == 'sleeping') return (state.toggleRedTimeout = setTimeout(toggleBlue, state.timeout));

  if (!state.settingDirection) {
    state.counter = ++state.counter % 20;

    if (state.counter == 19) turnPage();
  }

  state.blue = !state.blue;

  if (state.settingDirection) {
    LED3.write(state.blue);
  }

  state.toggleRedTimeout = setTimeout(toggleBlue, state.timeout);
};

const toggleRed = () => {
  state.red = !state.red;

  if (state.app == 'sleeping' && !state.red) resetState();

  LED1.write(state.red);
};

const toggleGreen = () => {
  if (state.app == 'sleeping') return;

  state.green = !state.green;

  LED2.write(state.green);
};

resetState();
toggleBlue();
toggleGreen();
