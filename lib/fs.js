const path = require('path')
const util = require('util')
const fs = require('fs')

const mkdir = util.promisify(require('mkdirp'))

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

exports.outputFile = (filepath, data, encoding) =>
  mkdir(path.dirname(filepath)).then(() => writeFile(filepath, data, encoding))

exports.readFile = readFile

exports.pathExists = fp =>
  new Promise(resolve => {
    fs.access(fp, err => {
      resolve(!err)
    })
  })

exports.getFolderSize = util.promisify(require('get-folder-size'))

exports.remove = util.promisify(require('rimraf'))

exports.readJSONFile = async file => JSON.parse(await readFile(file, 'utf8'))
