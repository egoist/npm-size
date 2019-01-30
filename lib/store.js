const path = require('path')
const os = require('os')
const { outputFile, readFile, pathExists } = require('./fs')

const FILE = path.join(os.homedir(), '.npm-size_store')

let data

module.exports = {
  async set(key, value) {
    data = data || (await this.get()) // eslint-disable-line require-atomic-updates
    data[key] = value
    await outputFile(FILE, JSON.stringify(data), 'utf8')
  },

  async get(key) {
    if (!data) {
      if (await pathExists(FILE)) {
        data = JSON.parse(await readFile(FILE, 'utf8'))
      } else {
        await this.clear()
      }
    }
    return key ? data[key] : data
  },

  async clear() {
    data = {}
    await outputFile(FILE, '{}', 'utf8')
  }
}
