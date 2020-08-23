import * as Path from 'path'
import * as FileSystem from 'fs'
import * as Handlebars from 'handlebars'

/**
 * @param {number} timeout
 * @return {Promise<any>}
 */
export function sleep(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

/**
 * @param {string} string
 * @param {Record<string, any>} replaces
 * @returns {string}
 */
export const replaceTemplate = (string: string, replaces: Record<string, unknown> | string[]) => {
  const template = Handlebars.compile(string)
  return template(replaces)
}

/**
 * @param file
 */
export const replaceExtension = (file: string) => {
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
export const replacePath = (template: string, replaces: Record<string, unknown> | string[], regex?: Function) => {
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
export function writeFile(path: string, contents: any) {
  FileSystem.mkdirSync(Path.dirname(path), {recursive: true})
  try {
    FileSystem.writeFileSync(path, contents)
    return true
  } catch (error) {
    // silent
  }
  return false
}
