const load = require('load-json-file')
const path = require('path')
const glob = require('glob')

module.exports = glob.sync(path.join(__dirname, '..', 'packages', '*', 'package.json')).map(packagePath => {
  const pkg = load.sync(packagePath)
  const name = pkg.name.replace(/@anystudio\//, "")
  return name
})