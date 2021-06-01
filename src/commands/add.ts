import {flags} from '@oclif/command'

import * as Path from 'path'
import * as FileSystem from 'fs'

import Base from '../helper/base'

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
    '$ devi add general --group | devi add general -g // create new namespace without schemas',
    '$ devi add main.category // add a new entity Category namespaced by Main',
    '$ devi add financial.bank-account // use kebab case',
    '$ devi add main.company.partners // use dot notation to nested items',
    '$ devi add foo.bar -o | devi add foo.bar --override // override all without ask',
    '$ devi add foo.bar -t=my-template // use a custom template (the default value is default)',
    '$ devi add foo.bar --template=my-template // use a custom template (the default value is default)',
    '$ devi add foo.bar -p=whatever | devi add foo.bar --parameters=whatever',
    '* special parameters:',
    '  - devi add foo.bar -p=array',
    '  - devi add foo.bar -p=builtin',
    '* JSON support:',
    '  - devi add foo.bar -p={"foo":"bar"}',
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
    group: flags.boolean({char: 'g'}),
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
        target: this.replaceExtension(String(this.replacePath(origin, replaces))),
      }
    })

    for (const entry of map) {
      const content = String(FileSystem.readFileSync(Path.join(source, entry.source)))
      const file = this.replaceTemplate(content, replaces)
      const filename = Path.join(target, entry.target)

      if (flags.override) {
        this.writeFile(Path.join(target, entry.target), file)
        continue
      }

      // eslint-disable-next-line no-await-in-loop
      const exists = await this.exists(filename)
      if (exists) {
        // eslint-disable-next-line no-await-in-loop
        const answer = await this.prompt(`  File '${entry.target}' already exists. Override?`, 'y')
        if (answer !== 'y') {
          continue
        }
      }
      this.writeFile(Path.join(target, entry.target), file)
    }
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
    if (!flags.group && fragments.length <= 1) {
      this.error('The domain is not valid')
      this.exit(2)
      return
    }

    const template = flags.template || target.template || 'default'

    let entity = fragments[0]
    if (!flags.group) {
      entity = String(fragments.pop())
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\/]/gi, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    }

    const domain = fragments.map(fragment => {
      return fragment
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\/]/gi, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    })

    const project = Path.join(process.cwd(), '.devitools', 'templates', template, 'index.js')
    const bundled = Path.join(__dirname, '..', '..', 'templates', template, 'index.js')

    let runner
    try {
      runner = require(project)
      this.disabled(`~> Template '${template}' loaded from project`)
    } catch (error) {
      // silent is gold
    }

    if (!runner) {
      try {
        runner = require(bundled)
        this.disabled(`~> Template '${template}' loaded from bundled`)
      } catch (error) {
        // silent is gold
      }
    }

    if (!runner) {
      this.log(JSON.stringify({bundled, project}, null, 2))
      this.error(`~> Template '${template}' not found`)
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

    await runner(this, target, entity, domain, parameters, flags.group)

    this.bye()
  }
}
