'use strict'

// Parses an OpenAPI file (including JSON references)
// Then validates its syntax
const loadOpenApiSpec = async function({ path }) {
  const spec = await parseSpec({ spec: path })

  validateOpenApi({ spec })

  return spec
}

const parseSpec = function({ spec }) {
  try {
    const sway = getSway()
    const specA = sway.create({ definition: spec })
    return specA
  } catch ({ message }) {
    const messageA = `OpenAPI specification could not be loaded: ${message}`
    throw new Error(messageA)
  }
}

// This is needed until https://github.com/whitlockjc/json-refs/pull/133
// is merged.
// Sway's dependency `json-refs` caches files, so when this function gets called
// again, it might received old file contents.
// This is problematic for Gulp tasks running in watch mode.
const getSway = function() {
  Object.keys(require.cache)
    .filter(path => path.includes('/sway/') || path.includes('/json-refs/'))
    .forEach(path => delete require.cache[path])
  const sway = require('sway')
  return sway
}

const validateOpenApi = function({ spec }) {
  const { errors, warnings } = spec.validate()
  const problems = [...errors, ...warnings]

  if (problems.length === 0) {
    return
  }

  reportOpenApiError({ problems })
}

const reportOpenApiError = function({ problems }) {
  const message = problems.map(getErrorMessage).join(`\n${INDENT}`)
  const messageA = `OpenAPI specification is invalid:\n${INDENT}${message}`
  throw new Error(messageA)
}

const INDENT_LENGTH = 8
const INDENT = ' '.repeat(INDENT_LENGTH)

const getErrorMessage = function({ path, message }) {
  return `At '${path.join('.')}': ${message}`
}

module.exports = {
  loadOpenApiSpec,
  parseSpec,
}
