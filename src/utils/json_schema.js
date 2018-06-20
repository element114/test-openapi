'use strict'

const Ajv = require('ajv')
const AjvKeywords = require('ajv-keywords')
const JSON_SCHEMA_SCHEMA = require('ajv/lib/refs/json-schema-draft-04')
const { omit } = require('lodash')
const memoize = require('fast-memoize')

// Validate a value against a JSON schema
const validateFromSchema = function({ schema, value, name }) {
  const passed = validator.validate(schema, value)

  if (passed) {
    return {}
  }

  const {
    errors: [error],
  } = validator
  const errorA = getError({ error, name })

  const { dataPath } = error
  const path = dataPath.replace(/^./, '')

  return { error: errorA, path }
}

// Human-friendly error
const getError = function({ error, name = '' }) {
  return validator.errorsText([error], { dataVar: name })
}

const getValidator = function() {
  const ajv = new Ajv(AJV_OPTS)

  AjvKeywords(ajv, CUSTOM_KEYWORDS)

  return ajv
}

const CUSTOM_KEYWORDS = ['typeof']

// Make logging silent (e.g. warn on unknown format) but throws on errors
const logger = {
  log() {},
  warn() {},
  error(message) {
    throw message
  },
}

const AJV_OPTS = {
  // AJV error messages can look overwhelming, so let's keep only the first one
  allErrors: false,
  format: 'full',
  // JSON schema allows unknown formats
  unknownFormats: 'ignore',
  logger,
}

const validator = getValidator()

// Compilation is automatically memoized by `ajv` but not validation
const mValidateFromSchema = memoize(validateFromSchema)

const getJsonSchemaSchema = function() {
  return SCHEMA_FIXES.reduce((schema, fix) => fix(schema), JSON_SCHEMA_SCHEMA)
}

const removeId = function(schema) {
  return omit(schema, ['id', '$schema'])
}

// `exclusiveMinimum` boolean is not valid in the JSON schema version used by `ajv`
const fixMultipleOf = function(schema) {
  const multipleOf = { type: 'number', exclusiveMinimum: 0 }

  return {
    ...schema,
    properties: { ...schema.properties, multipleOf },
  }
}

// `format` is not present in JSON schema v4 meta-schema but is actually allowed
const fixFormat = function(schema) {
  const format = { type: 'string' }
  return { ...schema, properties: { ...schema.properties, format } }
}

// `x-*` custom properties are not present in JSON schema v4 meta-schema but are
// actually allowed
const fixCustomProperties = function(schema) {
  return { ...schema, patternProperties: { '^x-*': {} }, additionalProperties: false }
}

// Allow `ajv-keywords` properties
const addCustomKeywords = function(schema) {
  const keywords = CUSTOM_KEYWORDS.map(name => ({ [name]: {} }))
  const keywordsA = Object.assign({}, ...keywords)

  return { ...schema, properties: { ...schema.properties, ...keywordsA } }
}

const SCHEMA_FIXES = [removeId, fixMultipleOf, fixFormat, fixCustomProperties, addCustomKeywords]

const jsonSchemaSchema = getJsonSchemaSchema()

const validateIsSchema = function({ value }) {
  return validateFromSchema({ schema: jsonSchemaSchema, value })
}

module.exports = {
  validateFromSchema: mValidateFromSchema,
  validateIsSchema,
}
