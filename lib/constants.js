const os = require('os')
const path = require('path')

exports.cacheDir = path.join(os.tmpdir(), 'npm-size')
