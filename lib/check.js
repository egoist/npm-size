const path = require('path')
const execa = require('execa')
const bytes = require('bytes')
const parsePackageName = require('parse-package-name')
const semver = require('semver')
const store = require('./store')
const fs = require('./fs')
const { cacheDir } = require('./constants')

const YARN = path.join(__dirname, '../node_modules/yarn/lib/cli.js')
const LOCAL_RE = /^[./]|(^[a-zA-Z]:)/

module.exports = async function(source) {
  let pkg
  let pkgName
  let storeKey
  let version = ''

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
    pkgName =
      path.resolve(source) === process.cwd() ? 'current directory' : source
  } else {
    const parsedPkg = parsePackageName(source)
    pkgName = parsedPkg.name
    pkg = source
    // Get size from cache
    // Get all available versions for this package
    const { stdout } = await execa(YARN, ['info', pkg, '--json'])
    if (stdout) {
      const pkgData = JSON.parse(stdout).data
      const versionByDistTag =
        pkgData['dist-tags'][parsedPkg.version || 'latest']
      if (versionByDistTag) {
        version = versionByDistTag
      } else if (parsedPkg.version) {
        // Get the latest vesion that matches the version range
        for (const v of pkgData.versions) {
          if (semver.satisfies(v, parsedPkg.version)) {
            version = v
          }
        }
      }
      if (version) {
        const cachedSize = await store.get(`${pkgName}::${version}`)
        if (cachedSize) {
          return {
            name: pkgName,
            version,
            size: cachedSize,
            prettySize: bytes(cachedSize, { unitSeparator: ' ' })
          }
        }
      }
    }
  }

  await execa(YARN, ['add', pkg, '--exact'], {
    cwd: dir
  })

  await fs.remove(path.join(dir, 'node_modules', '.bin'))
  const size = await fs.getFolderSize(path.join(dir, 'node_modules'))

  if (!storeKey) {
    const deps = (await fs.readJSONFile(targetPkgPath)).dependencies
    const depName = Object.keys(deps)[0]
    storeKey = `${depName}::${deps[depName]}`
  }

  await store.set(storeKey, size)

  // Clean up
  await fs.remove(dir)

  return {
    name: pkgName,
    version,
    size,
    prettySize: bytes(size, { unitSeparator: ' ' })
  }
}
