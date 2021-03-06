import {flags} from '@oclif/command'

import Base from '../helper/base'

import cli from 'cli-ux'
import * as open from 'open'
import * as Path from 'path'

import * as unlink from 'rimraf'
import createSimpleGit, {SimpleGit} from 'simple-git'
import * as chalk from 'chalk'

/**
 * @class {Create}
 */
export default class Create extends Base {
  /**
   * @type {string}
   */
  static description = 'create a new devitools project'

  /**
   * @type {string[]}
   */
  static examples = [
    '$ devi create <name>',
  ]

  /**
   * @type {Array}
   */
  static args = [
    {
      name: 'folder',
      required: true,
      description: 'the name of the new project folder',
      default: 'devitools',
    },
    {
      name: 'repo',
      required: false,
      description: 'repository base to create the new project',
      default: 'https://github.com/devitools/starter-kit.git',
    },
  ]

  /**
   * @type {Record<string, any>}
   */
  static flags = {
    help: flags.help({char: 'h'}),
  }

  /**
   * @param {string} pwd
   * @param {string} folder
   * @return {Promise<boolean>}
   */
  async override(pwd: string, folder: string) {
    const exists = await this.exists(pwd)
    if (!exists) {
      return true
    }
    const choices = [{name: 'Remove previous', value: 'remove'}, {name: 'Cancel', value: 'cancel'}]
    const overwrite = await this.select(`The directory ${folder} already exists ('${pwd}')`, choices)
    if (overwrite === 'cancel') {
      return false
    }

    cli.action.start('# remove previous', 'removing', {stdout: true})
    await unlink.sync(pwd)
    cli.action.stop('all removed')
    return true
  }

  /**
   */
  async run() {
    await this.welcome()
    const {args} = this.parse(Create)
    const folder = args.folder

    const pwd = Path.resolve(process.cwd(), folder)
    const override = await this.override(pwd, folder)
    if (!override) {
      this.bye()
      return
    }

    const name = await this.prompt('Project name', this.capitalize(folder))
    const short = await this.prompt('Project short name', folder)

    const templates = [
      {name: 'Laravel + Quasar', value: 'laravel-quasar'},
    ]
    const template = await this.select('Which template do you want use?', templates)
    const repository = args.repo
    const branch = `templates/${template}`

    cli.action.start('# downloading template', 'please wait', {stdout: true})

    try {
      await this.execute(`git clone -b ${branch} ${repository} ${folder}`)

      const git: SimpleGit = createSimpleGit(pwd)
      const script = Path.join(pwd, 'devitools.js')
      let installer = require(script)
      try {
        installer = require(script)
      } catch (error) {
        this.disabled(`~> The template '${template}' doesn't have an installer`)
      }
      if (installer) {
        try {
          await installer(this, pwd, {name, short, git})
        } catch (error) {
          this.error(error)
        }
      }
    } catch (error) {
      this.error(error)
    }

    cli.action.stop('all done')

    this.positive(`
        To get started use
  
          cd ${folder}
  
        then follow the README.md instructions to start the development environment
      `)

    this.log(chalk.yellow('      optionally you can also use commands like "devi env" and "devi init" to do this'))

    const doc = await this.select('Do you want to open the doc URL?', [{name: 'yes'}, {name: 'no'}])
    if (doc === 'yes') {
      open('https://github.com/devitools/starter-kit/tree/templates/laravel-quasar#-documenta%C3%A7%C3%A3o')
    }
    this.bye()
  }
}
