//const SamsungTv = require('samsung-remote')
const SamsungTv = require('./samsunglib/SamsungTv');

const args = process.argv.slice(2)
if (args.length != 4) {
  console.log('Usage: node samsungtest.js -ip <address of the TV device> -pin <pin>')
  console.log('  e.g. node samsungtest.js -ip 192.168.178.50 -pin 4888')
  return
}

const ip = args[1]
const pin = args[3]

// turn on debug logs
const DEBUG = true
console.debug = (...args) => {
  if (DEBUG) {
    console.log.apply(this, args)
  }
}

const deviceConfig = {
  ip,
  appId: '721b6fce-4ee6-48ba-8045-955a539edadb',
  userId: '654321',
}

console.log(deviceConfig);

var tv = new SamsungTv(deviceConfig)

// (optional) register listener on established connection
tv.onConnected(() => {
  //tv.sendKey('KEY_VOLUP')
})

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

// confirm PIN and send 'mute' key
tv.init()
  .then(() => tv.confirmPin(pin))
  .then(() => tv.connect())
  .then(() => {
      tv.sendKey('KEY_4');
      sleep(900);
      tv.sendKey('KEY_7');
  })
  .then(() => tv.connection.socket.close());
  //.then(() => tv.eventEmitter.removeAllListeners());



