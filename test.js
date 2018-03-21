/* eslint-env jest */
const sse = require('./index')

// response mock
const response = {
  headers: {},
  writables: [],
  socket: {
    fns: [],
    on: function (event, fn) {
      this.fns.push(fn)
    }
  },
  write: function (data) {
    this.writables.push(data)
  },
  setHeader: function (a, b) {
    this.headers[a] = b
  },
  end: () => {}
}

afterEach(() => {
  response.headers = {}
  response.writables = []
  response.socket.fns = []
})

test('can do initial handshake', () => {
  sse(response, 1)
  expect(response.headers).toEqual({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Content-Length': 5192
  })
  expect(response.writables[0].toString()).toEqual(':ok\n\n')
})

test('can send message', () => {
  const send = sse(response, 1)
  send('foo')
  expect(response.writables[1].toString()).toEqual('event: message\n')
  expect(response.writables[2].toString()).toEqual('retry: 1000\n')
  expect(response.writables[3].toString()).toEqual('id: 1\n')
  expect(response.writables[4].toString()).toEqual('data: foo\n\n')
})

test('can send error', () => {
  const send = sse(response, 1)
  send('foo', 'error')
  expect(response.writables[1].toString()).toEqual('event: error\n')
  expect(response.writables[2].toString()).toEqual('retry: 1000\n')
  expect(response.writables[3].toString()).toEqual('id: 1\n')
  expect(response.writables[4].toString()).toEqual('data: foo\n\n')
})

test('can do initial handshake with option maxEventSourceBufferSize', () => {
  sse(response, 1, {maxEventSourceBufferSize: 1024})
  expect(response.headers).toEqual({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Content-Length': 1024
  })
  expect(response.writables[0].toString()).toEqual(':ok\n\n')
})

test('can do initial handshake with option retry', () => {
  const send = sse(response, 1, {retry: 3000})
  send('foo')
  expect(response.writables[1].toString()).toEqual('event: message\n')
  expect(response.writables[2].toString()).toEqual('retry: 3000\n')
  expect(response.writables[3].toString()).toEqual('id: 1\n')
  expect(response.writables[4].toString()).toEqual('data: foo\n\n')
  response.socket.fns[0](response, 1)
})

test('can call close callback', () => {
  const closeCb = function (response, connectionId) {
    expect(connectionId).toEqual(1)
  }
  const send = sse(response, 1, {retry: 3000}, closeCb)
  send('foo')
  response.socket.fns[0](response, 1)
})

test('can call close callback with default options', () => {
  const closeCb = function (response, connectionId) {
    expect(connectionId).toEqual(1)
  }
  const send = sse(response, 1, closeCb)
  send('foo')
  response.socket.fns[0](response, 1)
})
