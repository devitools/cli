import {flags} from '@oclif/command'

import Base from '../helper/base'

import * as Path from 'path'
import {Settings} from '../definitions'
import cli from 'cli-ux'

/**
 * @class {Env}
 */
export default class Env extends Base {
  /**
   * @type {string}
   */
  static description = 'update the devitools resources'

  /**
   * @type {string[]}
   */
  static examples = [
    '$ devi env',
  ]

  /**
   * @type {Array}
   */
  static args = []

  /**
   * @type {Record<string, any>}
   */
  static flags = {
    help: flags.help({char: 'h'}),
  }

  /**
   * @param content
   * @param username
   * @param password
   */
  replaceWithCredentials(content: string, username: string, password: string) {
    return content
    .replace('"root@devi.tools"', `"${username}"`)
    .replace('"aq1sw2de3"', `"${password}"`)
  }

  /**
   * @param {string} path
   * @param {string} username
   * @param {string} password
   */
  async replaceEnv(path: string, username: string, password: string) {
    const envFile = Path.join(path, '.env')
    const envContent = String(this.readFile(Path.join(path, '.env.example')))
    const content = this.replaceWithCredentials(envContent, username, password)
    return this.writeFileNoOverride(envFile, content)
  }

  /**
   * @param {Settings} settings
   * @param {string} username
   * @param {string} password
   */
  async backend(settings: Settings, username: string, password: string) {
    const {short, back: {env, root}} = settings

    const back = Path.resolve(process.cwd(), this.removeStartSlash(root))
    await this.replaceEnv(back, username, password)

    if (env === 'local') {
      this.positive('Run backend as local can\'t determine how to run the project in dev mode')
      return
    }

    if (env !== 'docker') {
      return
    }

    const dockerComposeFile = Path.join(back, 'docker-compose.yml')
    const dockerComposerContent = this.readFile(Path.join(back, 'docker-compose.yml.example'))
    await this.writeFileNoOverride(dockerComposeFile, dockerComposerContent)

    cli.action.start('# configuring backend', 'please wait', {stdout: true})
    try {
      const options = {cwd: back}
      const docker = (command: string) => this.execute(
        `docker exec ${short}-nginx bash -c "su -c '${command}' application"`,
        options
      )

      await this.execute('docker-compose up -d', options)
      await docker('composer install')
      await docker('php artisan key:generate')
      await docker('php artisan jwt:secret --force')
      await docker('php artisan migrate:fresh')
      await this.execute('docker-compose down', options)
    } catch (error) {
      this.error(error)
    }
    cli.action.stop('all done')

    this.positive(`
      To run the backend in dev mode use

        cd backend
        docker-compose up -d
    `)
  }

  /**
   * @param {Settings} settings
   * @param {string} username
   * @param {string} password
   */
  async frontend(settings: Settings, username: string, password: string) {
    const {env, root} = settings.front

    const front = Path.resolve(process.cwd(), this.removeStartSlash(root))
    await this.replaceEnv(front, username, password)

    const options = {cwd: front}
    if (env === 'yarn') {
      cli.action.start('# configuring frontend', 'please wait', {stdout: true})
      await this.execute('yarn', options)
      cli.action.stop('all done')

      this.positive(`
        To run the frontend in dev mode use

          cd frontend
          yarn dev
      `)
      return
    }

    cli.action.start('# configuring frontend', 'please wait', {stdout: true})
    await this.execute('npm install', options)
    cli.action.stop('all done')
    this.positive(`
        To run the frontend in dev mode use

          npm run dev
      `)
  }

  /**
   */
  async run() {
    await this.welcome()

    const filename = Path.join(process.cwd(), '.devitools.json')
    const settings = await this.settings(filename)
    if (!settings) {
      this.warn('The project is not valid. Use "devi init" to configure devitools on this project.')
      this.bye()
      return
    }

    const username = await this.prompt('Enter the username of the admin user', 'root@devi.tools')
    const password = await this.prompt('Enter the password of the admin user', 'aq1sw2de3')

    if (settings.back.type) {
      this.disabled('Devitools "backend" detected')
      await this.backend(settings, username, password)
    }

    if (settings.front.type) {
      this.disabled('Devitools "frontend" detected')
      await this.frontend(settings, username, password)
    }

    this.bye()
  }
}
