var quickconnect = require('rtc-quickconnect')
var rtcDataStream = require('./index.js')
var stdout = require('browser-stdout')

console.log('connecting...')

quickconnect('https://switchboard.rtc.io/', { room: 'rtc-data-stream-demo' })
  .createDataChannel('demo')
  .on('channel:opened:demo', function(peerId, channel) {

    console.log('data channel opened for peer: ' + peerId)
  
    var duplexStream = rtcDataStream(channel)
    duplexStream.pipe(stdout())
    
    duplexStream.write('hello world')

  })