'use strict'

const { parseHeader } = require('../format')
const { capitalizeHeader } = require('../utils')
const { validateFromSchema } = require('./json_schema')

// Validates response headers against OpenAPI specification
const validateResHeaders = function({ test: { specResHeaders }, resHeaders }) {
  specResHeaders.forEach(({ name, schema, collectionFormat }) =>
    validateResHeader({ name, schema, collectionFormat, resHeader: resHeaders[name] }),
  )
}

const validateResHeader = function({ name, schema, collectionFormat, resHeader }) {
  validateResHeaderRequired({ name, resHeader })

  const value = parseHeader({ header: resHeader, schema, collectionFormat })
  validateResHeaderValue({ name, schema, value, resHeader })
}

// All response headers defined in the specification are considered required
const validateResHeaderRequired = function({ name, resHeader }) {
  if (resHeader !== undefined) {
    return
  }

  throw new Error(
    `Expected HTTP response header '${capitalizeHeader({ name })}' to be defined but it is not`,
  )
}

// Validates response header against JSON schema from specification
const validateResHeaderValue = function({ name, schema, value, resHeader }) {
  const headerName = capitalizeHeader({ name })
  const error = validateFromSchema({ schema, value, name: `headers['${headerName}']` })
  if (!error) {
    return
  }

  const resHeaderA = JSON.stringify(resHeader, null, 2)
  const errorA = `Invalid HTTP response header '${headerName}' with value ${resHeaderA}: ${error}`
  throw new Error(errorA)
}

module.exports = {
  validateResHeaders,
}
