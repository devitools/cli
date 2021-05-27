import {flags} from '@oclif/command'

import cli from 'cli-ux'
import * as inquirer from 'inquirer'
import * as Path from 'path'
import * as FileSystem from 'fs'

import Base from '../helper/base'

/**
 * @class {Init}
 */
export default class Init extends Base {
  /**
   * @type {string}
   */
  static description = 'Initialize a directory to be recognized as a devitools project'

  /**
   * @type {string}
   */
  static examples = [
    '$ devi init',
    '$ devi init -s // init a project with just frontend',
    '$ devi init -b // init a project with just backend',
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
   * @param {string} fallback
   */
  async front(fallback = '/frontend') {
    const responses: any = await inquirer.prompt([{
      name: 'type',
      message: 'Select [frontend] language/framework',
      type: 'list',
      choices: [{name: 'quasar'}, {name: 'vuetify'}, {name: 'material-ui'}],
    }])

    return {
      type: responses.type,
      root: await this.prompt('Frontend root dir', fallback),
      domains: await this.prompt('  (Frontend) Domains relative path', '/source/domains'),
      views: await this.prompt('  (Frontend) Views relative path', '/resources/views/dashboard'),
      i18n: await this.prompt('  (Frontend) I18n relative path', '/resources/lang'),
    }
  }

  /**
   * @param {string} fallback
   */
  async back(fallback = '/backend') {
    const responses: any = await inquirer.prompt([{
      name: 'type',
      message: 'Select [backend] language/framework',
      type: 'list',
      choices: [
        {name: 'laravel'}, {name: 'symfony'},
      ],
    }])

    return {
      type: responses.type,
      root: await this.prompt('Backend root dir', fallback),
      domains: await this.prompt('  (Backend) Domains relative path', '/app/Domains'),
      controller: await this.prompt('  (Backend) Controller relative path', '/app/Http/Controllers'),
      migration: await this.prompt('  (Backend) Migrations relative path', '/database/migrations'),
    }
  }

  /**
   */
  async run() {
    await this.welcome()

    const {flags} = this.parse(Init)

    const devitoolsFile = Path.join(process.cwd(), '.devitools.json')
    try {
      await FileSystem.promises.access(devitoolsFile)

      this.warn('The project has already started')
      return
    } catch (error) {
      // silent
    }

    const lang = await this.prompt('Default project language', 'en-us')
    const template = await this.prompt('Default project template', 'default')

    let front = {
      type: null,
      root: '',
      domains: '',
      views: '',
      i18n: '',
    }

    let back = {
      type: null,
      root: '',
      domains: '',
      controller: '',
      migration: '',
    }

    const both = !flags.front && !flags.front

    if (both) {
      front = await this.front()
      back = await this.back()
    } else if (flags.front) {
      front = await this.front('/')
    } else if (flags.back) {
      back = await this.back('/')
    }

    this.warn('The json will be created')

    const json = JSON.stringify({lang: [lang], template, front, back}, null, 2)

    this.log(json)
    await cli.anykey()

    FileSystem.writeFileSync(devitoolsFile, json)

    this.log('Project initialized successfully\n')
    this.notify('Project initialized successfully')
  }
}
