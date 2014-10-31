var quickconnect = require('rtc-quickconnect')
var duplexEmitter = require('duplex-emitter')
var rtcDataStream = require('./index.js')

quickconnect('http://rtc.io/switchboard', { room: 'rtc-data-stream-demo' })
.createDataChannel('demo')
.on('channel:opened:demo', function(peerId, channel) {

  console.log('data channel opened for peer: ' + peerId)

  var stream = window.stream = rtcDataStream(channel)
  var emitter = window.emitter = duplexEmitter(stream)

  emitter.emit('ready')
  emitter.on('ready', function() {
    console.log('got a ready')
  })

})
