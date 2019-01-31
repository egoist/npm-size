const path = require('path')
const execa = require('execa')
const prettyBytes = require('pretty-bytes')
const store = require('./store')
const fs = require('./fs')
const { cacheDir } = require('./constants')

const YARN = path.join(__dirname, '../node_modules/yarn/lib/cli.js')
const LOCAL_RE = /^[./]|(^[a-zA-Z]:)/

module.exports = async function(source) {
  let pkg
  let storeKey

  const id = Math.random()
    .toString(36)
    .substring(7)
  const dir = path.join(cacheDir, id)

  const targetPkgPath = path.join(dir, 'package.json')
  await fs.outputFile(
    targetPkgPath,
    JSON.stringify({
      private: true
    }),
    'utf8'
  )

  if (LOCAL_RE.test(source)) {
    pkg = path.join(dir, 'pkg.tgz')
    storeKey = path.resolve(source)
    await execa(YARN, ['pack', '--filename', pkg], {
      cwd: source
    })
  } else {
    pkg = source
  }

  await execa(YARN, ['add', pkg, '--exact'], {
    cwd: dir
  })

  const deps = JSON.parse(await fs.readFile(targetPkgPath, 'utf8')).dependencies
  const depName = Object.keys(deps)[0]

  const size = await fs.getFolderSize(path.join(dir, 'node_modules'))

  await fs.remove(dir)

  if (!storeKey) {
    storeKey = `${depName}:${deps[depName]}`
  }

  await store.set(storeKey, size)

  return prettyBytes(size)
}
