'use strict'

const { flatten, uniqBy } = require('lodash')

const { throwSpecificationError } = require('../../../errors')

const IN_TO_LOCATION = require('./in_to_location')

// Normalize OpenAPI security request parameters into specification-agnostic format
const getSecParams = function({
  spec: { securityDefinitions, security: apiSecurity = [] },
  operation: { security = apiSecurity },
}) {
  const secRefs = getSecRefs({ security })
  const secParams = secRefs.map(([secName, scopes]) =>
    getSecParam({ secName, scopes, securityDefinitions }),
  )
  return secParams
}

const getSecRefs = function({ security }) {
  const securityA = security.map(Object.entries)
  const securityB = flatten(securityA)
  const securityC = uniqBy(securityB, JSON.stringify)
  return securityC
}

// Retrieve among the `securityDefinitions`
const getSecParam = function({ secName, scopes, securityDefinitions }) {
  const securityDef = securityDefinitions[secName]
  const securityDefA = normalizeSecurityDef({ securityDef, secName })
  return { ...securityDefA, secName, scopes }
}

// Normalize security to the same format as other parameters
const normalizeSecurityDef = function({ securityDef, secName }) {
  const handler = getSecParamHandler({ securityDef, secName })
  const secParam = handler(securityDef)
  // Security parameters are not generated by default
  return { ...secParam, required: false }
}

const getSecParamHandler = function({ securityDef: { type }, secName }) {
  const handler = SECURITY_DEFS[type]

  if (handler !== undefined) {
    return handler
  }

  const property = `securityDefinitions.${secName}`
  throwSpecificationError(
    `In '${property}', security definition has type '${type}' but this has not been implemented yet`,
    { property },
  )
}

// `apiKey` security definitions -> `headers|query` request parameter
const getDefApiKey = function({ name, in: paramIn }) {
  const location = IN_TO_LOCATION[paramIn]
  return { name, location, value: { type: 'string' } }
}

const SECURITY_DEFS = {
  apiKey: getDefApiKey,
}

module.exports = {
  getSecParams,
}
