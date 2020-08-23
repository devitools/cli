import {Command} from '@oclif/command'

import cli from 'cli-ux'
import * as notifier from 'node-notifier'
import * as Path from 'path'
import * as FileSystem from 'fs'
import * as chalk from 'chalk'
import * as Handlebars from 'handlebars'
import * as pluralize from 'pluralize'

/**
 * @class {Base}
 */
export default abstract class Base extends Command {
  /**
   */
  async welcome() {
    await cli.url('@devitools', 'https://devi.tools')
    await cli.annotation('# Welcome to devitools family!', 'https://devi.tools')
    this.log('--')
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
   * @param {string} string
   * @param {Record<string, any>} replaces
   * @returns {string}
   */
  replaceTemplate = (string: string, replaces: Record<string, unknown> | string[]) => {
    const template = Handlebars.compile(string)
    return template(replaces)
  }

  /**
   * @param file
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
        string
      )
    }

    if (typeof replaces === 'object') {
      return Object.keys(replaces).reduce(
        (replacing, key) => replace(replacing, key, String(replaces[key])),
        string
      )
    }
  }

  /**
   * @param {string} path
   * @param {any} contents
   *
   * @return {Promise<any>}
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
   * @param {string} message
   * @param {string} fallback
   *
   * @return {Promise<string>}
   */
  async prompt(message: string, fallback: string): Promise<string> {
    const prompt = await cli.prompt(`${chalk.yellow('?')} ${message} [${fallback}]`, {required: false})
    if (!prompt) {
      return fallback
    }
    return String(prompt)
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
