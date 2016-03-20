/*!
 * capture-spawn <https://github.com/tunnckoCore/capture-spawn>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('assertit')
var captureSpawn = require('./index')
var spawn = require('cross-spawn-async')
var isBuffer = require('is-buffer')
var isChildProcess = require('is-child-process')

test('should throw TypeError when not child_process stream passed', function (done) {
  function fixture () {
    captureSpawn(1234)
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `cp` be child_process/)
  done()
})

test('should throw TypeError when `callback` not a function', function (done) {
  function fixture () {
    var cp = spawn('echo', ['hello world'])
    captureSpawn(cp, 12345)
  }

  test.throws(fixture, TypeError)
  test.throws(fixture, /expect `callback` be function/)
  done()
})

test('should handle errors correctly', function (done) {
  var stream = spawn('node', ['not existing', 'thingy'])
  captureSpawn(stream, function (err) {
    test.ifError(!err)
    test.strictEqual(err.code, 1)
    test.strictEqual(err.name, 'SpawnError')
    test.strictEqual(isBuffer(err.buffer), true)
    done()
  })
})

test('should get result correctly', function (done) {
  var stream = spawn('echo', ['hello world'])
  captureSpawn(stream, function (err, res) {
    test.ifError(err)
    test.strictEqual(res, 'hello world\n')
    done()
  })
})

test('should get empty string result if `stdio: inherit`', function (done) {
  var cp = spawn('echo', ['hello world foo'], {stdio: 'inherit'})
  captureSpawn(cp, function (e, result) {
    test.strictEqual(result, '')
    done()
  })
})

test('should get buffer result as third argument in callback', function (done) {
  var stream = spawn('echo', ['foo bar baz qux'])
  captureSpawn(stream, function (err, res, buf) {
    test.ifError(err)
    test.strictEqual(res, 'foo bar baz qux\n')
    test.strictEqual(isBuffer(buf), true)
    test.strictEqual(buf.toString(), 'foo bar baz qux\n')
    done()
  })
})

test('should handle errors when `stdio: inherit`', function (done) {
  var stream = spawn('foo-bar-baz-cli', ['hello world foo'], {stdio: 'inherit'})
  captureSpawn(stream, function (err, res) {
    test.ifError(!err)
    test.strictEqual(err.name, 'SpawnError')
    test.strictEqual(err.buffer, null)
    test.strictEqual(err.message.indexOf('foo-bar-baz-cli ENOENT') !== -1, true)
    done()
  })
})

test('should return passed child_process stream', function (done) {
  var cp = spawn('echo', ['hi'])
  var stream = captureSpawn(cp, function callback () {})
  test.strictEqual(isChildProcess(cp), true)
  test.strictEqual(isChildProcess(stream), true)
  test.strictEqual(cp, stream)
  done()
})

