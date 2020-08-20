/**
 * @param {string} input
 * @return {string}
 */
export function reverse(input: string) {
  return input.split('').reverse().join('')
}

/**
 * @param {string} input
 * @param {string} value
 * @return {string}
 */
export function prepend(input: string, value: string) {
  return `${value}${input}`
}

/**
 * @param {string} input
 * @return {string}
 */
export function capitalize(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1)
}

/**
 * @param {string} input
 * @return {string}
 */
export function unCapitalize(input: string) {
  return input.charAt(0).toLowerCase() + input.slice(1)
}

/**
 * @param {string} input
 * @param {boolean} [first]
 * @return {string}
 */
export function toCamelCase(input: string, first = false) {
  const camelCase = input.replace(/-([a-z])/g, group => group[1].toUpperCase())
  if (!first) {
    return camelCase
  }
  return capitalize(camelCase)
}

/**
 * @param {string} input
 * @return {string}
 */
export function toDashCase(input: string) {
  return input.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`)
}
