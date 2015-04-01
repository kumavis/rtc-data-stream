var DuplexStream = require('stream').Duplex
var util = require('util')

module.exports = RtcDataStream


util.inherits(RtcDataStream, DuplexStream)

function RtcDataStream(rtcChannel) {
  if (!(this instanceof RtcDataStream)) return new RtcDataStream(rtcChannel)

  DuplexStream.call(this)
 
  // bind events
  var rtc = this.rtc = rtcChannel
  // rtc.addEventListener('message', this._onMessage.bind(this))
  rtc.onmessage = this._onMessage.bind(this)
  rtc.onerror =  this._onError.bind(this)
  rtc.onclose = this._onClose.bind(this)
  rtc.onopen = this._onOpen.bind(this)

  // cleanup
  this.on('finish', function(){
    rtc.close()
  })
  this.on('error', function(){
    rtc.close()
  })
}

RtcDataStream.prototype._onMessage = function(event, flags) {
  console.log('onMessage:', arguments)
  var data = event.data ? event.data : event
  this.push(ab2Buffer(data))
}

RtcDataStream.prototype._onError = function(err) {
  console.log('onError:', arguments)
  this.emit('error', err)
}

RtcDataStream.prototype._onClose = function() {
  console.log('onClose:', arguments)
  this.push(null)
}

RtcDataStream.prototype._onOpen = function(err) {
  console.log('onOpen:', arguments)
  this.emit('readable')
}

RtcDataStream.prototype._read = noop

RtcDataStream.prototype._write = function(data) {
  try {
    this.rtc.send(Buffer(data).toArrayBuffer())
  } catch(e) {
    if (e.name == 'NetworkError') {
      // the stream closed but didn't tell us
      this._onClose(e)
    } else {
      this._onError(e)
    }
  }
}

// util

function noop() {}

function ab2Buffer(ab) {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
  }
  return buffer;
}