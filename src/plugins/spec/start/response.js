'use strict'

const { mapValues, omit } = require('lodash')

const { mergeHeaders } = require('../../../utils')

const { normalizeSchema } = require('./json_schema')
const { getNegotiationsResponse } = require('./content_negotiation')

// Normalize OpenAPI responses into specification-agnostic format
const normalizeResponses = function({ responses, spec, operation }) {
  return mapValues(responses, response => normalizeResponse({ response, spec, operation }))
}

const normalizeResponse = function({ response, spec, operation }) {
  const body = getResponseBody({ response })
  const headers = getResponseHeaders({ response, spec, operation })
  return { body, headers }
}

const getResponseBody = function({ response: { schema = {} } }) {
  return normalizeSchema({ schema })
}

const getResponseHeaders = function({ response: { headers = {} }, spec, operation }) {
  const headersA = Object.entries(headers).map(getResponseHeader)

  const contentNegotiations = getNegotiationsResponse({ spec, operation })

  const headersB = mergeHeaders([...contentNegotiations, ...headersA])

  return headersB
}

const getResponseHeader = function([name, header]) {
  // We do not support `header` `collectionFormat`
  const schema = omit(header, ['collectionFormat'])

  const value = normalizeSchema({ schema })

  return { name, value }
}

module.exports = {
  normalizeResponses,
}
