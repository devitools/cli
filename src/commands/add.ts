import {Command, flags} from '@oclif/command'

import * as Path from 'path'
import * as FileSystem from 'fs'
import {replacement, writeFile} from '../helper'
import {toCamelCase} from '../helper/string'
import cli from 'cli-ux'
import * as pluralize from 'pluralize'
import * as notifier from 'node-notifier'

/**
 * @class {Add}
 */
export default class Add extends Command {
  /**
   * @type {string}
   */
  static description = 'initialize a directory to be recognized as a devitools project'

  /**
   * @type {string[]}
   */
  static examples = [
    '$ devi add foo.bar',
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
    template: flags.string({char: 't', default: 'default'}),
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

  replaceExtension = (file: string) => {
    const pieces = file.split('.')
    // noinspection SpellCheckingInspection
    const extension = String(pieces.pop())
    .replace('tmplt', '')
    .replace('[', '')
    .replace(']', '')
    pieces.push(extension)
    return pieces.join('.')
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
        target: this.replaceExtension(replacement(origin, replaces)),
      }
    })

    for (const entry of map) {
      const content = String(FileSystem.readFileSync(Path.join(source, entry.source)))
      const file = replacement(content, replaces)
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
        const answer = await this.input(`  File '${entry.target}' already exists. Override?`, 'y')
        if (answer !== 'y') {
          continue
        }
      }
      writeFile(Path.join(target, entry.target), file)
    }
  }

  /**
   * @param {string} message
   * @param {string} fallback
   *
   * @return {string}
   */
  async input(message: string, fallback: string) {
    return await cli.prompt(`${message} [${fallback}]`, {required: false}) || fallback
  }

  /**
   */
  async run() {
    this.log('running command...')

    const devitoolsFile = Path.join(process.cwd(), '.devitools.json')
    try {
      await FileSystem.promises.access(devitoolsFile)
    } catch (error) {
      this.error('The project is not valid')
      this.exit(2)
      return
    }

    const {args, flags} = this.parse(Add)
    const fragments = String(args.domain).split('.')
    if (fragments.length <= 1) {
      this.error('The domain is not valid')
      this.exit(2)
      return
    }

    const template = flags.template

    const sourceSettings = {
      front: {
        root: 'front',
        domains: Path.join('source', 'domains'),
        views: Path.join('resources', 'views'),
      },
      back: {
        root: 'back',
        domains: Path.join('Domains'),
        controller: Path.join('Http', 'Controllers'),
        migration: Path.join('migrations'),
      },
    }
    const sourceFront = Path.join(__dirname, '..', '..', '.templates', template, sourceSettings.front.root)
    const sourceBack = Path.join(__dirname, '..', '..', '.templates', template, sourceSettings.back.root)

    const content = FileSystem.readFileSync(devitoolsFile)
    const targetSettings = JSON.parse(String(content))
    const targetFront = Path.join(process.cwd(), targetSettings.front.root)
    const targetBack = Path.join(process.cwd(), targetSettings.back.root)

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

    const lower = domain.map(entry => entry.toLowerCase())

    const collection = await this.input('  Table or collection:', pluralize(entity))
    const icon = await this.input('  Icon used on the interface:', 'folder')

    const pad = (input: number) => input < 10 ? '0' + input : input
    const date = new Date()
    const timestamp = date.getFullYear().toString() + '_' +
      pad(date.getMonth() + 1) +  '_' +
      pad(date.getDate()) +  '_' +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())

    const replaces = {
      entity: toCamelCase(entity, true),
      'entity.lower': entity.toLowerCase(),
      domain: domain.map(entry => toCamelCase(entry, true)).join('/'),
      'domain.lower': lower.join('/'),
      'domain.dotted': lower.join('.'),
      namespace: domain.map(entry => toCamelCase(entry, true)).join('\\'),
      collection,
      icon,
      'migration.file': `${timestamp}_${toCamelCase(collection)}-create`,
      'migration.class': `${toCamelCase(collection)}Create`,
    }

    await this.generate(
      Path.join(sourceFront, sourceSettings.front.domains),
      Path.join(targetFront, targetSettings.front.domains),
      replaces
    )
    await this.generate(
      Path.join(sourceFront, sourceSettings.front.views),
      Path.join(targetFront, targetSettings.front.views),
      replaces
    )

    await this.generate(
      Path.join(sourceBack, sourceSettings.back.domains),
      Path.join(targetBack, targetSettings.back.domains),
      replaces
    )
    await this.generate(
      Path.join(sourceBack, sourceSettings.back.controller),
      Path.join(targetBack, targetSettings.back.controller),
      replaces
    )
    await this.generate(
      Path.join(sourceBack, sourceSettings.back.migration),
      Path.join(targetBack, targetSettings.back.migration),
      replaces
    )

    await this.generate(
      Path.join(__dirname, '..', '..', '.templates', template, 'lang'),
      Path.join(targetFront, targetSettings.front.domains, replaces.domain, replaces.entity),
      replaces,
      targetSettings.lang.map((lang: string) => new RegExp(`${lang}.*`))
    )

    this.log('Domain created successfully\n')

    notifier.notify({
      title: 'Devitools',
      message: 'Domain created successfully!',
      icon: Path.join(__dirname, '..', '..', 'assets', 'logo.png'),
      wait: false,
    })
  }
}
