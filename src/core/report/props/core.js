'use strict'

const { isSimpleSchema } = require('../../../utils')

// Add core `reportProps`
const addCoreReportProps = function({ reportProps, task }) {
  const coreReportProps = getCoreReportProps(task)
  // Merged with lower priority, and appear at beginning
  return [coreReportProps, ...reportProps]
}

// Core `reportProps` always present on error
const getCoreReportProps = function({
  error: { expected, value, message, property, schema, plugin } = {},
}) {
  const values = getValues({ expected, value })
  const schemaA = getJsonSchema({ schema })
  const pluginA = getPlugin({ plugin })

  return { message, ...values, property, 'JSON schema': schemaA, plugin: pluginA }
}

const getValues = function({ expected, value }) {
  if (expected === undefined) {
    return { value }
  }

  return { 'actual value': value, 'expected value': expected }
}

const getJsonSchema = function({ schema }) {
  // Do not print JSON schemas which are simplistic, as they do not provide extra
  // information over `Expected value`
  if (isSimpleSchema(schema)) {
    return
  }

  return schema
}

// Only report `error.plugin` for external plugins
const getPlugin = function({ plugin }) {
  if (plugin === 'core') {
    return
  }

  return plugin
}

module.exports = {
  addCoreReportProps,
}