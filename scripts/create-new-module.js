#!/usr/bin/env node

const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs-extra')
const camelcase = require("camelcase")
const decamelize = require("decamelize")
const allPackageNames = require('../lib/all-package-names')

function returnConfig(config) {
  console.log(config)
  const { name = '', isJsx = false } = config
  if (!name) return null
  if (name.length < 3) return null
  // const nameCleaned = name.replace(/\s/g,'') // remove all whitespaces
  const camelcaseName = camelcase(name)
  const pascalcaseName = camelcase(name, {pascalCase: true})
  const functionName = isJsx ? pascalcaseName : camelcaseName
  const decamelizeName = decamelize(name)
  const folderPath = path.join(
    __dirname,
    '..',
    'packages',
    decamelizeName
  )
  return {
    name,
    isJsx,
    functionName,
    camelcaseName,
    pascalcaseName,
    decamelizeName,
    folderPath,
  }
}

function createFolders({ folderPath }) {
  if (fs.existsSync(folderPath)) return
  fs.mkdirSync(folderPath)
  // fs.mkdirSync(path.join(folderPath, 'src'))
}

function writeReadme({ folderPath, decamelizeName, functionName }) {
  const content = `# @anystudio/${decamelizeName}\n\n# ${functionName}`
  fs.writeFileSync(
    path.join(folderPath, 'README.md'),
    content
  )
}

function writeEntryFile({ folderPath, functionName }) {
  const functionInterface = `${functionName}Props`
  const content = `
interface ${functionInterface} {
  name: string
}

export default function ${functionName}(props:${functionInterface}) {
  return true
}
`
  fs.writeFileSync(
    path.join(folderPath, 'index.ts'),
    content
  )
}

function writePackageJson({ folderPath, decamelizeName }) {
  const content = `{
  "name": "@anystudio/${decamelizeName}",
  "version": "0.0.0",
  "description": "",
  "author": "Rupert Adlmaier <rupert@any.studio>",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  },
  "main": "dist/js/index.js",
  "module": "dist/es/index.js",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "import": "./dist/es/index.js",
      "require": "./dist/js/index.js"
    }
  },
  "types": "dist/js/index.d.ts",
  "sideEffects": false,
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "npm-run-all build:*",
    "build:es": "tsc --outDir dist/es --module esnext --declaration false && echo '{${'\\'}"type${'\\'}":${'\\'}"module${'\\'}"}' > dist/es/package.json",
    "build:js": "tsc"
  },
  "devDependencies": {
    "npm-run-all": "*",
    "tslint": "*",
    "typescript": "*"
  }
}`
  fs.writeFileSync(
    path.join(folderPath, 'package.json'),
    content
  )
}

function writeTypescriptConfig({ folderPath }) {
  const content = `{
  "extends": "../../tsconfig.shared.json",
  "compilerOptions": {
    "outDir": "dist/js"
  },
  "files": ["index.ts"]
}`
  fs.writeFileSync(
    path.join(folderPath, 'tsconfig.json'),
    content
  )
}

inquirer
  .prompt([
    {
      message: 'Name of new package',
      name: 'name',
      type: 'input',
      validate: (value) => {
        if (!value) return 'Name must be given'
        if (allPackageNames.includes(value)) return 'Name is already in use'
        return true
      },
    },
    {
      message: 'Is a JSX / React component',
      name: 'isJsx',
      type: 'confirm',
    },
  ])
  .then((values) => {
    const config = returnConfig(values)
    createFolders(config)
    writeEntryFile(config)
    writePackageJson(config)
    writeReadme(config)
    writeTypescriptConfig(config)
    console.log('Success!')
  })
  .catch((error) => {
    console.log('Something went wrong.')
  })