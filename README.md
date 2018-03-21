# @turbo-tools/sse

Server-Sent Events for [turbo-http](https://github.com/mafintosh/turbo-http) based servers

[![Build Status](https://travis-ci.org/turbo-tools/sse.svg?branch=master)](https://travis-ci.org/turbo-tools/sse)
[![npm (scoped)](https://img.shields.io/npm/v/@turbo-tools/sse.svg?style=flat-square)](https://www.npmjs.com/package/@turbo-tools/sse)
[![dependencies Status](https://david-dm.org/turbo-tools/sse/status.svg)](https://david-dm.org/turbo-tools/sse)
[![dependencies Status](https://david-dm.org/turbo-tools/sse/dev-status.svg)](https://david-dm.org/turbo-tools/sse#info=devDependencies)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3a5eb877cded679a7f76/test_coverage)](https://codeclimate.com/github/turbo-tools/sse/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/3a5eb877cded679a7f76/maintainability)](https://codeclimate.com/github/turbo-tools/sse/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fturbo-tools%2Fsse.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fturbo-tools%2Fsse?ref=badge_shield)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Greenkeeper badge](https://badges.greenkeeper.io/greenkeeperio/greenkeeper.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/turbo-tools/sse/badge.svg?targetFile=package.json)](https://snyk.io/test/github/turbo-tools/sse?targetFile=package.json)

## Getting Started

```js
const sse = require('@turbo-tools/sse')
```

### sse(response, connectionID, options = {}, closeCb = function () {})

Initializes the session. A connectionID must be given, it can be used to keep track of the connection. Default allocated buffer size is 5kb, it can be changes via the options object, using the `maxEventSourceBufferSize` property (in bytes).
The `retry` property can be used to set the retry interval if the connection is closes, the default is 1000ms.
If a `closeCb` is given, it will be called if the server or client terminates the connection. The first argument is the response object, the second is the connectionID.
It returns the `send` function that can be used to send the messages.

### send(data, type = 'message')

The function takes a string (data), that gets pushed to the client.
The default type is message, but can be adjusted.

More on Server-Sent Events can be found on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) and [HTML5Rocks](https://www.html5rocks.com/en/tutorials/eventsource/basics/)

## Example

```js
const sse = require('@turbo-tools/sse')
// initialize the connection (a connedction id must be given integer or string)
const sendMessage = sse(response, 1)
// send a message (must be a string)
sendMessage('Some string gettin´ pushed')
// messages can be send as long as the size of the allocated buffer isn't reached (5kb by default)
const iv = setInterval(() => sendMessage('pong'), 1000)
// closing the response closes the message channel as well
setTimeout(() => clearInterval(iv) && response.close(), 5000)
```

### With turbo-http server

```js
const http = require('turbo-http')
const sse = require('@turbo-tools/sse')

// Will be called if a connection gets terminated by the server or the client
const closeCb = function (response, clientId) {
  console.log(`Client with ID ${clientId} quit`)
}

// Create server
const server = http.createServer(function (request, response) {
  // should be a proper client id, not just a random number/string
  const clientId = Date.now()
  const options = {
    // reconnect timeout in ms, defaults to 1000ms
    retry: 1000,
    // size of the buffer that gets allocated in bytes, 5kb by default
    // after the size is reached, the connection is closed
    maxEventSourceBufferSize: 5192
  }
  // initialize the connection (a function that can be used to send messages is returned)
  const sendMessage = sse(response, clientId, options, closeCb)
  console.log(`Client with ID ${clientId} joined`)
})

// Listen
server.listen(3000)
```

### Installing

```bash
npm install @turbo-tools/sse --save
```

## Running the tests

All tests are contained in the [test.js](test.js) file, and written using [Jest](https://facebook.github.io/jest/docs/en/getting-started.html)

Run them:

```bash
npm test
```

If you´d like to get the coverage data in addition to runnign the tests, use:

```bash
npm run test-coverage
```

## Built With

* [NPM](https://www.npmjs.com/) - Dependency Management
* [Commitizen](https://github.com/commitizen/cz-cli) - Easy semantic commit messages
* [Jest](https://facebook.github.io/jest/) - Easy tests
* [Semantic Release](https://github.com/semantic-release/semantic-release) - Easy software releases

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests to us, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on the code of conduct.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/turbo-tools/sse/tags).

## Authors

* **Sebastian Golasch** - *Initial work* - [asciidisco](https://github.com/asciidisco)

See also the list of [contributors](https://github.com/turbo-tools/sse/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to [@mafintosh](https://github.com/mafintosh) for building [turbo-net](https://github.com/mafintosh/turbo-net) and [turbo-http](https://github.com/mafintosh/turbo-http)
