'use strict'

const { addErrorHandler, runTaskHandler } = require('../errors')

// Main entry point of tasks definition
const defineTasks = function({ config, errors }) {
  // Define all tasks with `it()`
  describe(DESCRIBE_TITLE, () => defineAllTasks({ config, errors }))
}

const DESCRIBE_TITLE = 'Tasks'

const defineAllTasks = function({ config: { tasks, runTask, ...config }, errors }) {
  const eRunTask = addErrorHandler(runTask, runTaskHandler)

  tasks.forEach(task => defineTask({ task, tasks, runTask: eRunTask, config, errors }))
}

// Define a single task with `it()`
// TODO: fix title when we refactor how reporting is done
// Method and path should be included in titles.
const defineTask = function({ task, task: { taskKey }, tasks, runTask, config, errors }) {
  // This means `this` context is lost.
  // We can remove the arrow function if we ever need the context.
  // Timeout is handled differently (i.e. not by the runner)
  it(
    taskKey,
    async () => {
      // Passed as second argument to every plugin
      const context = { config, tasks }

      await runTask(task, context, errors)
    },
    0,
  )
}

module.exports = {
  defineTasks,
}
