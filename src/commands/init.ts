import {Command, flags} from '@oclif/command'

import cli from 'cli-ux'
import * as notifier from 'node-notifier'
import * as Path from 'path'
import * as FileSystem from 'fs'

/**
 * @class {Init}
 */
export default class Init extends Command {
  /**
   * @type {string}
   */
  static description = 'initialize a directory to be recognized as a devitools project'

  /**
   * @type {string}
   */
  static examples = [
    '$ devi init',
    // '$ devi init -s',
    // '$ devi init -b',
  ]

  /**
   * @type {Record<string, any>}
   */
  static flags = {
    help: flags.help({char: 'h'}),
    front: flags.boolean({char: 'f'}),
    back: flags.boolean({char: 'b'}),
  }

  /**
   * @param {string} file
   * @param {Record<string, any>} data
   */
  async finish(file: string, data: Record<string, unknown>) {
    this.warn('The json will be created')

    const json = JSON.stringify(data, null, 2)

    this.log(json)
    await cli.anykey()

    FileSystem.writeFileSync(file, json)

    this.log('Project initialized successfully\n')

    notifier.notify({
      title: 'Devitools',
      message: 'Project initialized successfully!',
      icon: Path.join(__dirname, '..', '..', 'assets', 'logo.png'),
      wait: false,
    })
  }

  /**
   * @param {string} message
   * @param {string} fallback
   *
   * @return {string}
   */
  async folder(message: string, fallback: string) {
    return await cli.prompt(`${message}: [${fallback}]`, {required: false}) || fallback
  }

  /**
   */
  async run() {
    this.log('running command...')

    const {flags} = this.parse(Init)

    const devitoolsFile = Path.join(process.cwd(), '.devitools.json')
    try {
      await FileSystem.promises.access(devitoolsFile)

      this.warn('The project has already started')
      return
    } catch (error) {
      // silent
    }

    if (flags.front) {
      await this.finish(devitoolsFile, {})
      return
    }

    if (flags.back) {
      await this.finish(devitoolsFile, {})
      return
    }

    const lang = await this.folder('Default project language', 'en-us')

    const front = {
      framework: 'quasar',
      root: await this.folder('Frontend root dir', '/quasar'),
      domains: await this.folder('  (Frontend) Domains relative path', '/source/domains'),
      views: await this.folder('  (Frontend) Views relative path', '/resources/views/dashboard'),
      // lang: await this.folder('  (Frontend) Lang relative path', '/resources/lang'),
      // settings: await this.folder('  (Frontend) Settings relative path', `${front}src/settings`),
    }

    const back = {
      framework: 'laravel',
      root: await this.folder('Backend root dir', '/laravel'),
      domains: await this.folder('  (Backend) Domains relative path', '/app/Domains'),
      controller: await this.folder('  (Backend) Controller relative path', '/app/Http/Controllers'),
      migration: await this.folder('  (Backend) Migrations relative path', '/database/migrations'),
    }

    await this.finish(devitoolsFile, {lang: [lang], front, back})
  }
}
