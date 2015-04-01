var DuplexStream = require('stream').Duplex
var util = require('util')

module.exports = RtcDataStream


util.inherits(RtcDataStream, DuplexStream)

function RtcDataStream(rtcChannel) {
  if (!(this instanceof RtcDataStream)) return new RtcDataStream(rtcChannel, options)

  DuplexStream.call(this)
 
  // bind events
  var rtc = this.rtc = rtcChannel
  rtc.addEventListener('message', this._onMessage.bind(this))
  rtc.onerror =  this._onError.bind(this)
  rtc.onclose = this._onClose.bind(this)
  rtc.onopen = this._onOpen.bind(this)
  if (rtc.readyState === 'open') this._open = true

  // cleanup
  this.on('finish', function(){
    rtc.close()
  })
  this.on('error', function(){
    rtc.close()
  })
}

RtcDataStream.prototype._onMessage = function(event, flags) {
  var data = event.data ? event.data : event
  this.push(data)
}

RtcDataStream.prototype._onError = function(err) {
  this.emit('error', err)
}

RtcDataStream.prototype._onClose = function() {
  this.push(null)
}

RtcDataStream.prototype._onOpen = function(err) {
  this.emit('readable')
}

RtcDataStream.prototype._read = noop

RtcDataStream.prototype._write = function(data) {
  try {
    this.rtc.send(data);
  } catch(e) {
    if (e.name == 'NetworkError') {
      // the stream closed but didn't tell us
      this._onClose(e);
    } else {
      this._onError(e);
    }
  }
}

function noop() {}