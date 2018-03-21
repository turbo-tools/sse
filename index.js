/**
 * Classic noop
 *
 * @private
 */

function noop () {}

/**
 *
 * @param {object} response
 * @param {Buffer} maxEventSourceBufferSize
 * @param {Buffer} ackBuffer
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
 *
 * @param {object} response
 * @param {(integer|string)} connectionID
 * @param {function} closeCb [optional]
 * @private
 */

function close (response, connectionID, closeCb) {
  closeCb(response, connectionID)
  response.end()
}

/**
 *
 * @param {object} response
 * @param {Buffer} retryBuffer
 * @param {Buffer} idBuffer
 * @param {string} data
 * @param {string} type [optional]
 * @public
 */

function send (response, retryBuffer, idBuffer, data, type = 'message') {
  response.write(Buffer.from(`event: ${type}\n`))
  response.write(retryBuffer)
  response.write(idBuffer)
  response.write(Buffer.from(`data: ${data}\n\n`))
}

/**
 *
 * @param {object} response
 * @param {(integer|string)} connectionID
 * @param {object} options [optional]
 * @param {(integer|string)} options.retry [optional]
 * @param {(integer|string)} options.maxEventSourceBufferSize [optional]
 * @param {function} closeCb [optional]
 * @returns {function}
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
  return send.bind(null, response, retryBuffer, idBuffer)
}

module.exports = sse
