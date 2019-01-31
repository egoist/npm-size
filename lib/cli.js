#!/usr/bin/env node
const path = require('path')
const cac = require('cac')
const stringWidth = require('string-width')
const pkg = require('../package')

const cli = cac()

cli
  .command('[...packages]', 'Check the install size of given packages')
  .option('-V, --verbose', 'Verbose output')
  .action(
    handleError(async (packages, options) => {
      if (packages.length === 0) return cli.outputHelp()

      const Listr = require('listr')
      const colors = require('chalk')

      const CWD_NAME = 'current directory'
      const isCwd = str => path.resolve(str) === process.cwd()
      const names = packages.map(pkg => (isCwd(pkg) ? CWD_NAME : pkg))
      let maxLength = findLongest(names)

      const tasks = new Listr(
        packages.map((pkg, i) => {
          const getDefaultTitle = i =>
            `${padRight(names[i], maxLength)} ${colors.dim('analyzing..')}`
          return {
            title: getDefaultTitle(i),
            task: async ({ titles }) => {
              const check = require('./check')
              const { version, prettySize } = await check(pkg)
              names[i] += version ? colors.dim(`@${version}`) : ''
              maxLength = findLongest(names)

              titles[i] = `${padRight(names[i], maxLength)} ${colors.green(
                prettySize
              )}`

              for (const [taskIndex, task] of tasks.tasks.entries()) {
                if (titles[taskIndex]) {
                  task.title = titles[taskIndex]
                } else {
                  task.title = getDefaultTitle(taskIndex)
                }
              }
            }
          }
        }),
        {
          concurrent: true,
          renderer:
            process.env.CI || !process.stdout.isTTY || options.verbose
              ? 'verbose'
              : 'default'
        }
      )
      await tasks.run({ titles: {} })
    })
  )

cli.version(pkg.version)

cli.help()

cli.parse()

function handleError(fn) {
  return async (...args) => {
    try {
      await fn(...args)
    } catch (error) {
      console.error(error.stack)
      process.exit(1)
    }
  }
}

function findLongest(arr) {
  return arr.reduce((res, next) => {
    const width = stringWidth(next)
    return width > res ? width : res
  }, 0)
}

function padRight(str, length) {
  return `${str}${' '.repeat(length - stringWidth(str))}`
}
