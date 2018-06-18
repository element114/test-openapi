'use strict'

const { fireFetch } = require('./fetch')
const { getFetchResponse } = require('./response')

// Fire actual HTTP call
const request = async function(
  { call, call: { rawRequest } },
  { config: { call: { timeout = DEFAULT_TIMEOUT } = {} } },
) {
  const rawResponse = await fireFetch({ rawRequest, timeout })

  const rawResponseA = await getFetchResponse({ rawResponse, timeout })

  return { call: { ...call, rawResponse: rawResponseA } }
}

const DEFAULT_TIMEOUT = 1e4

module.exports = {
  request,
}