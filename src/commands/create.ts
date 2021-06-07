import {flags} from '@oclif/command'

import Base from '../helper/base'

import cli from 'cli-ux'
import * as open from 'open'
import * as Path from 'path'

import * as unlink from 'rimraf'
import createSimpleGit, {SimpleGit} from 'simple-git'

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
      default: 'git@github.com:devitools/starter-kit.git',
    },
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

    const {args} = this.parse(Create)
    const folder = args.folder

    const pwd = Path.resolve(process.cwd(), folder)
    const exists = await this.exists(pwd)
    if (exists) {
      const choices = [{name: 'Remove previous', value: 'remove'}, {name: 'Cancel', value: 'cancel'}]
      const overwrite = await this.select(`The directory ${folder} already exists ('${pwd}')`, choices)
      if (overwrite === 'cancel') {
        this.bye()
        return
      }
      cli.action.start('# remove previous', 'removing', {stdout: true})
      unlink.sync(pwd)
      cli.action.stop('all removed')
    }

    const choices = [
      {name: 'Laravel + Quasar', value: 'laravel-quasar'},
    ]
    const template = await this.select('Which template do you want use?', choices)

    const repository = args.repo

    const branch = `templates/${template}`
    cli.action.start('# download template', 'downloading', {stdout: true})

    try {
      await this.execute(`git clone -b ${branch} ${repository} ${folder}`)
      const git = Path.resolve(pwd, '.git')
      unlink.sync(git)
      const gitManager: SimpleGit = createSimpleGit(pwd)
      await gitManager.init().add('.').commit('init')
    } catch (error) {
      this.error(error)
    }

    cli.action.stop('all done')

    this.positive(`
      To get started:

        cd ${folder}

      follow the README.md instructions to start the development environment
    `)

    const doc = await this.select('Do you want to open the doc URL?', [{name: 'yes'}, {name: 'no'}])
    if (doc === 'yes') {
      open('https://github.com/devitools/starter-kit/tree/templates/laravel-quasar#-documenta%C3%A7%C3%A3o')
    }

    this.bye()
  }
}
