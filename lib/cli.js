#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const cac = require('cac')
const stringWidth = require('string-width')
const bytes = require('bytes')
const pkg = require('../package')

const cli = cac('npm-size')

cli
  .command('[...packages]', 'Check the install size of given packages')
  .option(
    '--package',
    'Specify that the package list to analyse come from the project package list'
  )
  .option('--limit <size>', 'Exit with error when the size excceeds the limit')
  .option('-V, --verbose', 'Verbose output')
  .example(bin => `  ${bin} ava tap tape jest`)
  .example(bin => `  ${bin} ./ --limit 3MB`)
  .action(
    handleError(async (packages, options) => {
      if (packages.length === 0 && !options.package) return cli.outputHelp()
      if (options.package) {
        const packagepath = './package.json'
        if (!fs.existsSync(packagepath)) {
          throw new Error(
            '--package was provided but no package.json file found in the current directory'
          )
        }
        const pjson = JSON.parse(fs.readFileSync(packagepath))
        packages = packages.concat(
          Object.keys(pjson.dependencies),
          Object.keys(pjson.devDependencies)
        )
      }

      const Listr = require('listr')
      const colors = require('chalk')

      const CWD_NAME = 'current directory'
      const isCwd = str => path.resolve(str) === process.cwd()
      const names = packages.map(pkg => (isCwd(pkg) ? CWD_NAME : pkg))
      let maxLength = findLongest(names)

      const getTitle = (index, result) => {
        if (!result) {
          return `${padRight(names[index], maxLength)} ${colors.dim(
            'analyzing..'
          )}`
        }

        const { size, prettySize } = result

        const sizeLimit = options.limit && bytes.parse(options.limit)
        const exceededSizeLimit = size > sizeLimit
        if (exceededSizeLimit) {
          process.exitCode = 1
        }

        return exceededSizeLimit
          ? `${padRight(names[index], maxLength)} ${colors.red(
              prettySize
            )} ${colors.red(
              `(limit: ${bytes.format(sizeLimit, {
                unitSeparator: ' '
              })})`
            )}`
          : `${padRight(names[index], maxLength)} ${colors.green(prettySize)}`
      }

      const tasks = new Listr(
        packages.map((pkg, i) => {
          return {
            title: getTitle(i),
            task: async ({ results }, task) => {
              const check = require('./check')
              const result = await check(pkg, task)
              results[i] = result

              const { name, version } = result
              names[i] = `${name}${version ? colors.dim(`@${version}`) : ''}`
              maxLength = findLongest(names)

              for (const [taskIndex, task] of tasks.tasks.entries()) {
                task.title = getTitle(taskIndex, results[taskIndex])
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
      await tasks.run({ results: {} })
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
