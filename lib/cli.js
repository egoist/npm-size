#!/usr/bin/env node
const path = require('path')
const cac = require('cac')
const pkg = require('../package')

const cli = cac()

cli.command('[...packages]', 'Check the install size of given packages').action(
  handleError(async packages => {
    if (packages.length === 0) return cli.outputHelp()

    const Listr = require('listr')
    const colors = require('chalk')

    const CWD_NAME = 'current directory'
    const isCwd = str => path.resolve(str) === process.cwd()
    const names = packages.map(pkg => (isCwd(pkg) ? CWD_NAME : pkg))
    const maxLength = findLongest(names).length
    const tasks = new Listr(
      packages.map((pkg, i) => {
        const name = names[i]
        return {
          title: `${padRight(name, maxLength)}  ${colors.dim('analyzing..')}`,
          task: async (context, task) => {
            const check = require('./check')
            const size = await check(pkg)
            task.title = `${padRight(name, maxLength)}  ${colors.green(size)}`
          }
        }
      }),
      {
        concurrent: true
      }
    )
    await tasks.run()
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
    return next.length > res.length ? next : res
  }, '')
}

function padRight(str, length) {
  return `${str}${' '.repeat(length - str.length)}`
}
