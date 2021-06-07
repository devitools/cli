import {flags} from '@oclif/command'

import Base from '../helper/base'

import cli from 'cli-ux'

import * as Path from 'path'
import * as FileSystem from 'fs'

/**
 * @class {Add}
 */
export default class Update extends Base {
  /**
   * @type {string}
   */
  static description = 'update the devitools resources'

  /**
   * @type {string[]}
   */
  static examples = [
    '$ devi update',
  ]

  /**
   * @type {Array}
   */
  static args = [
  ]

  /**
   * @type {Record<string, any>}
   */
  static flags = {
    help: flags.help({char: 'h'}),
  }

  /**
   */
  async run() {
    await this.welcome()

    const filename = Path.join(process.cwd(), '.devitools.json')
    const exists = await this.exists(filename)
    if (!exists) {
      this.error('The project is not valid')
      this.exit(2)
      return
    }

    const content = FileSystem.readFileSync(filename)
    const settings = JSON.parse(String(content))

    const choices = []
    if (settings.front.type) {
      this.disabled('Devitools "frontend" detected')
      choices.push({name: 'frontend'})
    }
    if (settings.back.type) {
      this.disabled('Devitools "backend" detected')
      choices.push({name: 'backend'})
    }
    if (choices.length === 2) {
      choices.push({name: 'both'})
    }

    const {update} = await this.choose('update', 'Which one do you wanna update?', choices)

    cli.action.start('# cleaning up', 'waiting', {stdout: true})
    await this.execute('git submodule foreach --recursive git reset --hard')
    cli.action.stop('all clear')

    if (update === 'frontend') {
      const root = settings.front.root.split('/')
      root.shift()
      const frontend = root.join('/') + '/@devitools'
      cli.action.start('# updating frontend', 'waiting', {stdout: true})
      await this.execute(`git submodule update --remote --recursive "${frontend}"`)
      // eslint-disable-next-line no-warning-comments
      // TODO: review the strategy
      // frontend\@devitools$ git checkout nightly
      // frontend\@devitools$ git merge --ff --ff-only refs/remotes/origin/nightly
      // frontend\@devitools$ git checkout nightly
    }

    if (update === 'backend') {
      const root = settings.back.root.split('/')
      root.shift()
      const backend = root.join('/') + '/@devitools'
      cli.action.start('# updating backend', 'waiting', {stdout: true})
      await this.execute(`git submodule update --remote --recursive "${backend}"`)
    }

    if (update === 'both') {
      cli.action.start('# updating', 'waiting', {stdout: true})
      await this.execute('git submodule update --remote --recursive')
    }
    cli.action.stop('all updated')

    this.bye()
  }
}
