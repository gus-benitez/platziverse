'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./')
const getConfig = require('./lib/config')

const prompt = inquirer.createPromptModule()

async function setup () {
  let executeAutom = false

  process.argv.forEach((value, index) => {
    if (value.toLowerCase() === '--yes' || value.toLowerCase() === '-y') {
      executeAutom = true
    }
  })

  if (!executeAutom) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ])
    if (!answer.setup) {
      return console.log('Nothing happened :)')
    }
  }
  const config = getConfig({
    logging: s => debug(s),
    setup: true,
    operatorsAliases: false
  })

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
