import * as Path from 'path'
import * as FileSystem from 'fs'

/**
 * @param {number} timeout
 * @return {Promise<any>}
 */
export function sleep(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

/**
 * @param {string} template
 * @param {Record<string, unknown> | string[]} replaces
 * @param {Function} [regex]
 * @returns {string}
 */
export const replacement = (template: string, replaces: Record<string, unknown> | string[], regex?: Function) => {
  const string = String(template)
  let keyFy: Function = (expression: string) => new RegExp(`\\[\\[${expression}\\]\\]`, 'g')
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

  return template
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
