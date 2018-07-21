'use strict'

const { isObject, searchRegExp } = require('../utils')

// Parse:
//  - `$$name` into `{ type: 'value', name: '$$name' }`
//  - `{ $$name: arg }` into `{ type: 'function', name: '$$name', arg }`
//  - `$$name $$nameB` into `{ type: 'concat', tokens }`
const parseHelper = function(data) {
  if (typeof data === 'string') {
    return parseHelperString(data)
  }

  // Not an helper
  if (!isObject(data)) {
    return
  }

  const keys = Object.keys(data)
  // Helpers are objects with a single property starting with `$$`
  // This allows objects with several properties not to need escaping
  if (keys.length !== 1) {
    return
  }

  const [name] = keys
  if (!name.startsWith(HELPERS_PREFIX)) {
    return
  }

  // `{ $$name: arg }`
  const arg = data[name]
  return { type: 'function', name, arg }
}

const parseHelperString = function(data) {
  const tokens = searchRegExp(HELPERS_REGEXP_GLOBAL, data)

  // No matches
  if (tokens === undefined) {
    return
  }

  // Single `$$name` without concatenation.
  // As opposed to concatenated string, `$$name` is not transtyped to string.
  if (tokens.length === 1) {
    return { type: 'value', name: data }
  }

  // `$$name` inside another string, i.e. concatenated
  const tokensA = tokens.map(parseToken)
  return { type: 'concat', tokens: tokensA }
}

const parseToken = function(name) {
  const type = HELPERS_REGEXP.test(name) ? 'value' : 'raw'
  return { type, name }
}

// Check whether `data` is an helper
const isHelper = function(data) {
  const helper = parseHelper(data)
  return helper !== undefined && !isEscape({ helper })
}

// To escape an object that could be taken for an helper (but is not), one can
// add an extra `$`, i.e. `{ $$$name: arg }` becomes `{ $$name: arg }`
// and `$$$name` becomes `$$name`
// This works with multiple `$` as well
const parseEscape = function({ helper, helper: { type, name, arg } }) {
  if (!isEscape({ helper })) {
    return
  }

  const nameA = name.replace(HELPERS_ESCAPE, '')

  if (type === 'function') {
    return { [nameA]: arg }
  }

  return nameA
}

const isEscape = function({ helper: { type, name, tokens } }) {
  if (type === 'concat') {
    return tokens.some(helper => isEscape({ helper }))
  }

  return isEscapeName({ name })
}

// Check if name is a valid helper's `$$name`
const isHelperName = function({ name }) {
  return HELPERS_REGEXP.test(name) && !isEscapeName({ name })
}

const isEscapeName = function({ name }) {
  return name.startsWith(`${HELPERS_ESCAPE}${HELPERS_PREFIX}`)
}

// Matches `$$name` where `name` can only include `A-Za-z0-9_-` and also
// dot/bracket notations `.[]`
const HELPERS_REGEXP = /^\$\$[\w-.[\]]+$/
const HELPERS_REGEXP_GLOBAL = /\$\$[\w-.[\]]+/g
// Escape `$$name` with an extra dollar sign, i.e. `$$$name`
const HELPERS_PREFIX = '$$'
const HELPERS_ESCAPE = '$'

module.exports = {
  parseHelper,
  isHelper,
  parseEscape,
  isHelperName,
}