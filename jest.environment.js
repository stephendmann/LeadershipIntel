/**
 * jsdom test environment plus the WHATWG fetch globals.
 *
 * jsdom does not implement Request/Response/Headers/fetch. @clerk/backend
 * references `Request` at module scope, and it is reached from lib/global.js ->
 * @clerk/nextjs, so any suite importing lib/ or a theme component died with
 * "ReferenceError: Request is not defined" before a single test ran.
 *
 * This file executes in the Node realm, where Node 22 provides those globals
 * natively, so they can be handed to the sandbox without adding a dependency
 * or polyfill. Production runs on the same Node version, so the tests see the
 * same implementations the app does.
 */
const JSDOMEnvironment = require('jest-environment-jsdom').default

class JsdomWithFetchGlobals extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context)

    for (const name of [
      'Request',
      'Response',
      'Headers',
      'fetch',
      'FormData',
      'Blob',
      'File',
      'ReadableStream',
      'TextEncoder',
      'TextDecoder',
      'structuredClone'
    ]) {
      if (this.global[name] === undefined && globalThis[name] !== undefined) {
        this.global[name] = globalThis[name]
      }
    }
  }
}

module.exports = JsdomWithFetchGlobals
