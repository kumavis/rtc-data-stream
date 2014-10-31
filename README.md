# rtc-data-stream

### Easy Peer to Peer Streams in the Browser via Browserify!

To use [WebRTC](http://www.webrtc.org/) the Node way: with streams!

```javascript
emitter.emit('Hello!')
emitter.on('Hello!', function() {
  console.log('A new visitor has connected!')
})
```

## Simple two-way example

```javascript
var rtcDataStream = require('rtc-data-stream')
var quickconnect = require('rtc-quickconnect')
var duplexEmitter = require('duplex-emitter')

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
```

`rtc` is a stream and speaks stream events: `data`, `error` and `end`. that means you can pipe output to anything that accepts streams.

## Interactive Examples

You can [try an online example via requirebin](http://requirebin.com/?gist=1ac2891d276ae07e46cd).
(open in two browser windows)

You can run the included example like this:

```
# install beefy
npm install -g beefy
# clone repo
git clone https://github.com/kumavis/rtc-data-stream
cd rtc-data-stream
# install dev dependencies
npm install
# start the example
npm start
# open another tab with the generated link
```

### Advanced WebRTC Note

You don't **need** to use `rtc-quickconnect`, it's just an easy way to get a reliable [RTCDataChannel](http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcdatachannel).  If you need more configuration options, you can consider creating this object yourself using the [WebRTC Standard](http://www.webrtc.org/).

## credit
Based on [websocket-stream](https://github.com/maxogden/websocket-stream) by [max ogden](https://twitter.com/maxogden)

## license
BSD LICENSE
