#!/usr/bin/env node

const {execSync} = require('child_process')
const inquirer = require('inquirer')
const allPackageNames = require('../lib/all-package-names')
const npmScope = require('../lib/npm-scope')

inquirer
  .prompt([
    {
      message: 'To which packages is the dependency added?',
      name: 'packageNames',
      type: 'checkbox',
      choices: allPackageNames,
      validate: (value) => {
        if (!value || value.length < 1) return 'Must select at least one package'
        return true
      },
    },
    {
      message: 'What dependency do you want to add?',
      name: 'dependency',
      type: 'input',
      validate: (value) => {
        if (!value) return 'Dependency name must be given'
        return true
      },
    },
  ])
  .then(({ dependency, packageNames }) => {
    const cmd = `lerna add ${dependency} --scope=${packageNames.length > 1 ? `{${packageNames.map(name => `${npmScope}/${name}`).join(',')}}` : `${npmScope}/${packageNames[0]}`}`
    return `${cmd} --dev && ${cmd} --peer`
  })
  .then((cmd) => {
    console.log(`Running:`)
    console.log(cmd)
    execSync(cmd)
    console.log('Success!')
  })
  .catch((error) => {
    console.log('Something went wrong.')
  })