/*!
 * capture-spawn <https://github.com/tunnckoCore/capture-spawn>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var isChildProcess = require('is-child-process')
var errorBase = require('error-base')

/**
 * > Capture output of asynchronous `spawn`.
 *
 * @param  {Stream}   `cp` Child process spawn stream.
 * @param  {Function} `callback` Handle errors and results of passed `cp`.
 * @return {Stream} Passed `cp` stream
 * @api public
 */

module.exports = function captureSpawn (cp, callback) {
  if (!isChildProcess(cp)) {
    throw new TypeError('capture-spawn: expect `cp` be child_process.spawn stream')
  }
  if (typeof callback !== 'function') {
    throw new TypeError('capture-spawn: expect `callback` be function')
  }

  var stdout = null
  var stderr = null

  cp.stdout && cp.stdout.on('data', function (data) { // eslint-disable-line no-unused-expressions
    stdout = Buffer.concat([stdout || new Buffer(''), data || new Buffer('')])
  })
  cp.stderr && cp.stderr.on('data', function (buf) { // eslint-disable-line no-unused-expressions
    stderr = stderr || new Buffer('')
    stderr = Buffer.concat([stderr, buf || new Buffer('')])
  })

  function done (err) {
    cp.removeListener('close', done)
    cp.removeListener('error', done)

    var code = typeof err === 'number' ? err : err && err.code
    if (code === 0) {
      callback(null, stdout && stdout.toString() || '', stdout)
      return
    }

    err = typeof err === 'object' ? err : {code: err}
    callback(new SpawnError(err.message || '', {
      code: err.code || err.status || 1,
      buffer: stderr
    }))
  }

  cp.once('error', done)
  cp.once('close', done)
  return cp
}

/**
 * > Custom error class that is thrown on error.
 *
 * @param {String} `message`
 * @param {Object} `options`
 * @api private
 */

function SpawnError (message, options) {
  return errorBase('SpawnError', function (message, options) {
    this.name = 'SpawnError'
    this.message = message
    this.code = options.code
    this.buffer = options.buffer
  }).call(this, message, options)
}
