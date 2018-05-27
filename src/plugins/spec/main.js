'use strict'

const { loadOpenApiSpec, loadNormalizedSpec } = require('./start')
const { mergeSpecParams, mergeSpecValidate } = require('./task')

module.exports = {
  loadOpenApiSpec,
  start: loadNormalizedSpec,
  task: [mergeSpecParams, mergeSpecValidate],
  dependencies: ['config', 'tasks', 'request', 'generate', 'validate'],
}
