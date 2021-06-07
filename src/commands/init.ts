import {flags} from '@oclif/command'

import cli from 'cli-ux'
import * as Path from 'path'
import * as FileSystem from 'fs'

import Base from '../helper/base'
import {Back, Front} from '../definitions'

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
    '$ devi init -f | devi init --front // init a project with just frontend',
    '$ devi init -b | devi init --back // init a project with just backend',
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
   * @return {Promise<Front>}
   */
  async front(fallback = '/frontend'): Promise<Front> {
    const type = await this.select(
      'Select [frontend] language/framework',
      [{name: 'quasar'}, {name: 'vuetify', disabled: true}, {name: 'material-ui', disabled: true}]
    )

    const envs = [
      {name: 'Yarn', value: 'yarn'},
      {name: 'Npm', value: 'npm'},
    ]
    return {
      type: type,
      env: await this.select('Frontend environment', envs),
      root: await this.prompt('Frontend root dir', fallback),
      domains: await this.prompt('##  (Frontend) Domains relative path', '/source/domains'),
      views: await this.prompt('##  (Frontend) Views relative path', '/resources/views/dashboard'),
      settings: await this.prompt('##  (Frontend) Settings relative path', '/src'),
      routes: await this.prompt('##  (Frontend) Routes relative path', '/routes/dashboard'),
      i18n: await this.prompt('##  (Frontend) I18n relative path', '/resources/lang'),
    }
  }

  /**
   * @param {string} fallback
   * @return {Promise<Back>}
   */
  async back(fallback = '/backend'): Promise<Back> {
    const type = await this.select(
      'Select [backend] language/framework',
      [{name: 'laravel'}, {name: 'symfony', disabled: true}],
    )

    const envs = [
      {name: 'Docker', value: 'docker'},
      {name: 'Local', value: 'local'},
    ]
    return {
      type: type,
      env: await this.select('Backend environment', envs),
      root: await this.prompt('Backend root dir', fallback),
      domains: await this.prompt('##  (Backend) Domains relative path', '/app/Domains'),
      controllers: await this.prompt('##  (Backend) Controller relative path', '/app/Http/Controllers'),
      migrations: await this.prompt('##  (Backend) Migrations relative path', '/database/migrations'),
      routes: await this.prompt('##  (Backend) Routes relative path', '/routes/api'),
    }
  }

  /**
   * @param {string} filename
   * @return {Promise<boolean>}
   */
  async override(filename: string) {
    const exists = await this.exists(filename)
    if (!exists) {
      return true
    }
    const choices = [{name: 'Yes', value: 'override'}, {name: 'No', value: 'cancel'}]
    const overwrite = await this.select('The project has already started. Do you want override it?', choices)
    return overwrite !== 'cancel'
  }

  /**
   */
  async run() {
    await this.welcome()

    const {flags} = this.parse(Init)

    const filename = Path.join(process.cwd(), '.devitools.json')
    const override = await this.override(filename)
    if (!override) {
      this.bye()
      return
    }

    const name = await this.prompt('Project name', 'Devitools App')
    const short = await this.prompt('Project short name', 'devitools')
    const lang = await this.prompt('Default project language', 'en-us')
    const template = await this.prompt('Default project template', 'default')

    let front: Front = {
      type: null,
      env: '',
      root: '',
      domains: '',
      views: '',
      settings: '',
      routes: '',
      i18n: '',
    }

    let back: Back = {
      type: null,
      env: '',
      root: '',
      domains: '',
      controllers: '',
      migrations: '',
      routes: '',
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

    const json = JSON.stringify({name, short, lang, template, front, back}, null, 2)

    this.log(json)
    await cli.anykey()

    FileSystem.writeFileSync(filename, json)

    this.bye()
  }
}
