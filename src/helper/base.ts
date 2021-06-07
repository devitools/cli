import {Command} from '@oclif/command'

import cli from 'cli-ux'
import * as notifier from 'node-notifier'
import * as Path from 'path'
import * as FileSystem from 'fs'
import * as chalk from 'chalk'
import * as Handlebars from 'handlebars'
import * as pluralize from 'pluralize'
import * as inquirer from 'inquirer'
import {QuestionCollection} from 'inquirer'
import {Back, Front, Settings} from '../definitions'

/**
 * @class {Base}
 */
export default abstract class Base extends Command {
  /**
   */
  async welcome() {
    await cli.url('@devitools', 'https://devi.tools')
    await cli.annotation(chalk.green('✨ Welcome to devitools family!'), 'https://devi.tools')
    this.log('--')
  }

  /**
   */
  async bye() {
    this.log('--')
    this.positive('# All done!')
  }

  /**
   * @param {string} filename
   * @return {Promise<{Settings} | undefined>}
   */
  async settings(filename: string): Promise<Settings | undefined> {
    const exists = await this.exists(filename)
    if (!exists) {
      return
    }

    const content = FileSystem.readFileSync(filename)
    return JSON.parse(String(content))
  }

  /**
   * @param {string} message
   */
  async positive(message: string) {
    this.log(chalk.green(message))
  }

  /**
   * @param {string} message
   */
  async negative(message: string) {
    this.log(chalk.red(message))
  }

  /**
   * @param {string} message
   */
  async disabled(message: string) {
    this.log(chalk.gray(message))
  }

  /**
   * @param {string} input
   * @return {string}
   */
  reverse(input: string) {
    return input.split('').reverse().join('')
  }

  /**
   * @param {string} input
   * @param {string} value
   * @return {string}
   */
  prepend(input: string, value: string) {
    return `${value}${input}`
  }

  /**
   * @param {string} input
   * @return {string}
   */
  capitalize(input: string) {
    return input.charAt(0).toUpperCase() + input.slice(1)
  }

  /**
   * @param {string} input
   * @return {string}
   */
  unCapitalize(input: string) {
    return input.charAt(0).toLowerCase() + input.slice(1)
  }

  /**
   * @param {string} input
   * @param {boolean} [first]
   * @return {string}
   */
  toCamelCase(input: string, first = false) {
    const camelCase = input.replace(/-([a-z])/g, group => group[1].toUpperCase())
    if (!first) {
      return camelCase
    }
    return this.capitalize(camelCase)
  }

  /**
   * @param {string} input
   * @return {string}
   */
  toDashCase(input: string) {
    return input.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`)
  }

  /**
   * @param input
   */
  pluralize(input: string): string {
    return pluralize(input)
  }

  /**
   * @param input
   */
  removeStartSlash(input: string): string {
    return input.replace(/^\//, '')
  }

  /**
   * @param {string} string
   * @param {Record<string, any>} replaces
   * @returns {string}
   */
  replaceTemplate = (string: string, replaces: Record<string, unknown> | string[]) => {
    const template = Handlebars.compile(string)
    return template(replaces)
    .replace(/#php/g, '<?php')
    .replace(/#\/php/g, '<?')
  }

  /**
   * @param {string} file
   * @returns {string}
   */
  replaceExtension = (file: string) => {
    const pieces = file.split('.')
    // remove the old extension
    pieces.pop()
    // get the extension inside []
    const extension = String(pieces.pop()).replace('[', '').replace(']', '')
    // put the extension on array
    pieces.push(extension)
    return pieces.join('.')
  }

  /**
   * @param {string} template
   * @param {Record<string, any>} replaces
   * @param {Function} regex
   * @returns {string}
   */
  replacePath = (template: string, replaces: Record<string, unknown> | string[], regex?: Function) => {
    const string = String(template)
    let keyFy: Function = (expression: string) => new RegExp(`{{${expression}}}`, 'g')
    if (regex) {
      keyFy = regex
    }
    const replace = (replacing: string, key: string, value: string) => {
      return replacing.replace(keyFy(key), value)
    }

    if (Array.isArray(replaces)) {
      return replaces.reduce(
        (replacing, value, index) => replace(replacing, String(index), String(value)),
        string,
      )
    }

    if (typeof replaces === 'object') {
      return Object.keys(replaces).reduce(
        (replacing, key) => replace(replacing, key, String(replaces[key])),
        string,
      )
    }
  }

  /**
   * @param {string} path
   * @param {any} contents
   *
   * @return {boolean}
   */
  writeFile(path: string, contents: any) {
    FileSystem.mkdirSync(Path.dirname(path), {recursive: true})
    try {
      FileSystem.writeFileSync(path, contents)
      return true
    } catch (error) {
      // silent
    }
    return false
  }

  /**
   * @param {string} filename
   * @param {any} content
   *
   * @return {boolean}
   */
  async writeFileNoOverride(filename: string, content: any) {
    const exists = await this.exists(filename)
    if (!exists) {
      return this.writeFile(filename, content)
    }
    const confirm = await this.confirm(`  File '${filename}' already exists. Override?`)
    if (!confirm) {
      return
    }
    return this.writeFile(filename, content)
  }

  /**
   * @param {string} filename
   *
   * @return {Buffer|null}
   */
  readFile(filename: string) {
    try {
      return FileSystem.readFileSync(filename)
    } catch (error) {
      // silent
    }
    return null
  }

  /**
   * @param {string} message
   * @param {string | Record<string, unknown>} options
   *
   * @return {Promise<string>}
   */
  async prompt(message: string, options: string | Record<string, unknown> = {}): Promise<string> {
    let fallback = ''
    if (typeof options === 'string') {
      fallback = options
    }

    let required = false
    if (typeof options === 'object') {
      const {fallback: f, required: r} = options
      if (typeof f !== 'undefined') {
        fallback = String(f)
      }
      if (typeof r !== 'undefined') {
        required = Boolean(r)
      }
    }

    let advice = ''
    if (fallback) {
      advice = ` [${fallback}]`
    }
    const prompt = await cli.prompt(`${chalk.yellow('?')} ${message}${advice}`, {required})
    if (!prompt) {
      return fallback
    }
    return String(prompt)
  }

  /**
   * @param {string} name
   * @param {string} message
   * @param {QuestionCollection} choices
   * @param {string} type
   * @return {Promise<any>}
   */
  choose(name: string, message: string, choices: QuestionCollection, type = 'list') {
    return inquirer.prompt([{name, message, type, choices}])
  }

  /**
   * @param {string} message
   * @param {QuestionCollection} choices
   * @return {Promise<any>}
   */
  async select(message: string, choices: QuestionCollection) {
    const name = 'select'
    const type = 'list'
    const selected = await inquirer.prompt([{name, message, type, choices}])
    return selected[name]
  }

  /**
   * @param {string} message
   * @return {Promise<boolean>}
   */
  async confirm(message: string): Promise<boolean> {
    const name = 'confirm'
    const type = 'list'
    const choices = [{name: 'yes', value: true}, {name: 'no', value: false}]
    const selected = await inquirer.prompt([{name, message, type, choices}])
    return selected[name]
  }

  /**
   * @param {string} filename
   * @return {Promise<boolean>}
   */
  async exists(filename: string) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await FileSystem.promises.access(filename)
      return true
    } catch (error) {
      // silent is gold
    }
    return false
  }

  /**
   * @param {string} command
   * @param {*} options
   */
  execute(command: string, options = {}): Promise<string> {
    const exec = require('child_process').exec

    return new Promise((resolve, reject) => {
      const handler = function (error: unknown, stdout: string, stderr: string) {
        if (error) {
          reject(stderr)
          return
        }
        resolve(stdout)
      }
      exec(command, options, handler)
    })
  }

  /**
   * @param {string} message
   */
  notify(message: string) {
    try {
      notifier.notify({
        message,
        title: 'Devitools',
        icon: Path.join(__dirname, '..', '..', 'assets', 'logo.png'),
        wait: false,
      })
    } catch (error) {
      // silent is gold
    }
  }
}
