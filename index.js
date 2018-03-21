/**
 * Classic noop
 *
 * @private
 */

function noop () {}

/**
 * Initializes the connection
 *
 * @param {object} response Turbo HTTP response object
 * @param {Buffer} maxEventSourceBufferSize Size of the message buffer (5kb by default)
 * @param {Buffer} ackBuffer Connection body
 * @private
 */

function initialize (response, maxEventSourceBufferSize, ackBuffer) {
  response.setHeader('Content-Type', 'text/event-stream')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('Connection', 'keep-alive')
  response.setHeader('Content-Length', maxEventSourceBufferSize)
  response.statusCode = 200
  response.write(ackBuffer)
}

/**
 * Calls the close callback & ends the response
 *
 * @param {object} response Turbo HTTP response object
 * @param {(integer|string)} connectionID Given connection id
 * @param {function} closeCb Callback that gets called when the connection is closed [optional]
 * @private
 */

function close (response, connectionID, closeCb) {
  closeCb(response, connectionID)
  response.end()
}

/**
 * Pushes a message to the client
 *
 * @param {object} response Turbo HTTP response object
 * @param {object} buf Buffer containing connection id & retry interval
 * @param {Buffer} buf.retry Retry interval in ms
 * @param {Buffer} buf.id Connection id
 * @param {string} data Data to be pushed to the client
 * @param {string} type Type (or topic) of the event [optional]
 * @public
 */

function send (response, buf, data, type = 'message') {
  response.write(Buffer.from(`event: ${type}\n`))
  response.write(buf.retry)
  response.write(buf.id)
  response.write(Buffer.from(`data: ${data}\n\n`))
}

/**
 *
 * @param {object} response Turbo HTTP response object
 * @param {(integer|string)} connectionID Given connection id
 * @param {object} options Retry interval & size of the buffer to be allocated [optional]
 * @param {(integer|string)} options.retry Retry interval in ms (1000ms default) [optional]
 * @param {(integer|string)} options.maxEventSourceBufferSize Size of the message buffer (5kb by default) [optional]
 * @param {function} closeCb Callback that gets called when the connection is closed [optional]
 * @returns {function} The send function
 * @public
 */

function sse (response, connectionID, options = {}, closeCb = noop) {
  // if no options are given, but a function is assigned, assume it´s the close cb
  if (typeof options === 'function') {
    closeCb = options
    options = {}
  }
  // assign default values
  options = {...{retry: 1000, maxEventSourceBufferSize: 5192}, ...options}
  // prepare buffer objects, so that they only need to generated once at startup & can be reused
  const ackBuffer = Buffer.from(':ok\n\n')
  const retryBuffer = Buffer.from(`retry: ${options.retry}\n`)
  const idBuffer = Buffer.from(`id: ${connectionID}\n`)
  // if the underlying socket closes, we make sure to call the close callback
  response.socket.on('close', close.bind(null, response, connectionID, closeCb))
  // initialize connection
  initialize(response, options.maxEventSourceBufferSize, ackBuffer)
  // return a send function, that can be used to push data to the client
  return send.bind(null, response, {retry: retryBuffer, id: idBuffer})
}

module.exports = sse
