'use strict'

const { handleDryRun } = require('./handle')

module.exports = {
  handleDryRun,
  dependencies: ['config', 'tasks'],
}
