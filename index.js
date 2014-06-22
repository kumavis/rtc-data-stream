var stream = require('stream')
var util = require('util')

function RtcDataStream(rtcChannel, options) {
  if (!(this instanceof RtcDataStream)) return new RtcDataStream(rtcChannel, options)
  stream.Stream.call(this)
  this.options = options || {}
  this.readable = true
  this.writable = true
  this._buffer = []
 
  // bind events
  this.rtc = rtcChannel
  this.rtc.addEventListener('message', this.onMessage.bind(this))
  this.rtc.onerror =  this.onError.bind(this)
  this.rtc.onclose = this.onClose.bind(this)
  this.rtc.onopen = this.onOpen.bind(this)
  if (this.rtc.readyState === 'open') this._open = true
}

util.inherits(RtcDataStream, stream.Stream)

module.exports = RtcDataStream
module.exports.RtcDataStream = RtcDataStream

RtcDataStream.prototype.onMessage = function(e, flags) {
  var data = e
  if (data.data) data = data.data
  
  // type must be a Typed Array (ArrayBufferView)
  var type = this.options.type
  if (type && data instanceof ArrayBuffer) data = new type(data)
  
  this.emit('data', data, flags)
}

RtcDataStream.prototype.onError = function(err) {
  this.emit('error', err)
}

RtcDataStream.prototype.onClose = function(err) {
  if (this._destroy) return
  this.emit('end')
  this.emit('close')
}

RtcDataStream.prototype.onOpen = function(err) {
  if (this._destroy) return
  this._open = true
  for (var i = 0; i < this._buffer.length; i++) {
    this._write(this._buffer[i])
  }
  this._buffer = undefined
  this.emit('open')
  this.emit('connect')
  if (this._end) this.rtc.close()
}

RtcDataStream.prototype.write = function(data) {
  if (!this._open) {
    this._buffer.push(data)
  } else {
    this._write(data)
  }
}

RtcDataStream.prototype._write = function(data) {
  try {
    this.rtc.send(data);
  } catch(e) {
    if (e.name == 'NetworkError') {
      // the stream closed but didn't tell us
      this.onClose(e);
    } else {
      this.onError(e);
    }
  }
}

RtcDataStream.prototype.end = function(data) {
  if (data !== undefined) this.write(data)
  if (this._open) this.rtc.close()
  this._end = true
}

RtcDataStream.prototype.destroy = function() {
  this._destroy = true
  this.rtc.close()
}
