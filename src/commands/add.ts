import {flags} from '@oclif/command'

import * as Path from 'path'
import * as FileSystem from 'fs'
import * as pluralize from 'pluralize'

import Base from '../helper/base'
import {replacePath, replaceExtension, replaceTemplate, writeFile} from '../helper/util'
import {toCamelCase} from '../helper/string'

/**
 * @class {Add}
 */
export default class Add extends Base {
  /**
   * @type {string}
   */
  static description = 'initialize a directory to be recognized as a devitools project'

  /**
   * @type {string[]}
   */
  static examples = [
    '$ devi add foo.bar',
    '$ devi add foo.bar --override | devi add foo.bar --o',
    '$ devi add foo.bar --template=my-template | devi add foo.bar -t=my-template',
  ]

  /**
   * @type {Array}
   */
  static args = [
    {
      // name of arg to show in help and reference with args[name]
      name: 'domain',
      // make the arg required with `required: true`
      required: true,
      // help description
      description: 'the domain that will be created',
      // hide this arg from help
      // hidden: false,
      // default value if no arg input
      // default: 'world',
      // only allow input to be from a discrete set
      // options: ['a', 'b'],
    },
  ]

  /**
   * @type {Record<string, any>}
   */
  static flags = {
    help: flags.help({char: 'h'}),
    override: flags.boolean({char: 'o'}),
    template: flags.string({char: 't'}),
    parameters: flags.string({char: 'p'}),
  }

  /**
   * @param {string} dir
   * @param {string[]} filter
   */
  getFiles(dir: string, filter: string[] = []) {
    const isDirectory = (path: string) => FileSystem.statSync(path).isDirectory()
    const isNotWanted = (path: string) => {
      if (filter.length === 0) {
        return true
      }
      for (const expression of filter) {
        if (path.match(expression)) {
          return true
        }
      }
      return false
    }

    const getDirectories = (path: string) => FileSystem
    .readdirSync(path)
    .map((name: string) => Path.join(path, name))
    .filter(isDirectory)

    const isFile = (path: string) => FileSystem.statSync(path).isFile()
    const getFiles = (path: string) => FileSystem
    .readdirSync(path).map(name => Path.join(path, name))
    .filter(isFile)
    .filter(isNotWanted)

    const getFilesRecursively = (path: string): string[] => {
      const dirs = getDirectories(path)
      const files = dirs
      .map(dir => getFilesRecursively(dir)) // go through each directory
      .reduce((a, b) => a.concat(b), [])    // map returns a 2d array (array of file arrays) so flatten
      return files.concat(getFiles(path))
    }

    return getFilesRecursively(dir)
  }

  /**
   * @param {string} source
   * @param {string} target
   * @param {Record<string, any> | string[]} replaces
   * @param {string[]} filter
   */
  async generate(source: string, target: string, replaces: Record<string, unknown> | string[], filter: string[] = []) {
    const {flags} = this.parse(Add)
    const files = this.getFiles(source, filter)

    const map = files.map(file => {
      const origin = file.replace(source, '')
      return {
        source: origin,
        target: replaceExtension(String(replacePath(origin, replaces))),
      }
    })

    for (const entry of map) {
      const content = String(FileSystem.readFileSync(Path.join(source, entry.source)))
      const file = replaceTemplate(content, replaces)
      const filename = Path.join(target, entry.target)

      if (flags.override) {
        writeFile(Path.join(target, entry.target), file)
        continue
      }

      let exists = false
      try {
        // eslint-disable-next-line no-await-in-loop
        await FileSystem.promises.access(filename)
        exists = true
      } catch (error) {
        // silent is gold
      }

      if (exists) {
        // eslint-disable-next-line no-await-in-loop
        const answer = await this.prompt(`  File '${entry.target}' already exists. Override?`, 'y')
        if (answer !== 'y') {
          continue
        }
      }
      writeFile(Path.join(target, entry.target), file)
    }
  }

  /**
   * @param input
   */
  pluralize(input: string): string {
    return pluralize(input)
  }

  /**
   * @param {string} input
   * @param {boolean} [first]
   * @return {string}
   */
  toCamelCase(input: string, first = false): string {
    return toCamelCase(input, first)
  }

  /**
   */
  async run() {
    await this.welcome()

    const devitoolsFile = Path.join(process.cwd(), '.devitools.json')
    try {
      await FileSystem.promises.access(devitoolsFile)
    } catch (error) {
      this.error('The project is not valid')
      this.exit(2)
      return
    }
    const content = FileSystem.readFileSync(devitoolsFile)
    const target = JSON.parse(String(content))

    const {args, flags} = this.parse(Add)
    const fragments = String(args.domain).split('.')
    if (fragments.length <= 1) {
      this.error('The domain is not valid')
      this.exit(2)
      return
    }

    const template = target.template || flags.template || 'default'

    const entity = String(fragments.pop())
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\/]/gi, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

    const domain = fragments.map(fragment => {
      return fragment
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\/]/gi, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    })

    const project = Path.join(process.cwd(), '.devitools', 'templates', template, 'add.js')
    const bundled = Path.join(__dirname, '..', '..', 'templates', template, 'add.js')

    let runner
    try {
      runner = require(project)
      this.log(`Template '${template}' loaded from project`)
    } catch (error) {
      // silent is gold
    }

    if (!runner) {
      try {
        runner = require(bundled)
        this.log(`Template '${template}' loaded from bundled`)
      } catch (error) {
        // silent is gold
      }
    }

    if (!runner) {
      this.log(JSON.stringify({bundled, project}, null, 2))
      this.error(`Template '${template}' not found`)
      return
    }

    let parameters: Record<string, any> = {}
    if (flags.parameters) {
      const input = flags.parameters
      try {
        parameters = JSON.parse(input)
      } catch (error) {
        const pieces = String(input).split('.')
        for (const piece of pieces) {
          const fragments = piece.split('=')
          if (fragments.length > 1) {
            const [key, value] = fragments
            parameters[key] = value === 'false' ? false : value
            continue
          }
          parameters[piece] = true
        }
      }
    }

    runner(this, target, entity, domain, parameters)
  }
}
