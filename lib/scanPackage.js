const fs = require('./fs')

module.exports = async pkg => {
  if (pkg.endsWith('package.json')) {
    const content = await fs.readJSONFile(pkg, 'utf8')
    return content
  }
}
