import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as notifier from 'node-notifier'
import * as Path from 'path'
import * as FileSystem from 'fs'

export default class Init extends Command {
  static description = 'Initialize a directory to be recognized as a devitools project'

  static examples = [
    '$ devi init -m',
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    monorepo: flags.boolean({char: 'm'}),
  }

  async run() {
    // cli.action.start('initializing...')
    // cli.action.stop('done')
    const {flags} = this.parse(Init)

    const devitoolsFile = Path.join(process.cwd(), '.devitools')
    try {
      await FileSystem.promises.access(devitoolsFile)

      this.warn('This project is already initiated')
      return
    } catch (error) {
    }

    let base = ''
    if (flags.monorepo || (await cli.prompt('\nIs a monorepo? [y/n]') || 'n') === 'y') {
      base = await cli.prompt('\nFrontend root dir: [quasar/]', {required: false}) || 'quasar/'
    }

    const domains = await cli.prompt(`\nDomains relative path: [${base}source/domains]`, {required: false}) || `${base}source/domains`
    const views = await cli.prompt(`\nViews relative path: [${base}resources/views]`, {required: false}) || `${base}resources/views`
    const lang = await cli.prompt(`\nLang relative path: [${base}resources/lang]`, {required: false}) || `${base}resources/lang`
    const settings = await cli.prompt(`\nSettings relative path: [${base}src/settings]`, {required: false}) || `${base}src/settings`

    const dt = {front: {domains, views, lang, settings}}
    this.log(`\nThe json will be created:\n${JSON.stringify(dt)}\n`)
    await cli.anykey()

    FileSystem.writeFileSync(devitoolsFile, JSON.stringify(dt))

    this.log('\nProject initialized sucessfully\n')
    notifier.notify({
      title: 'Devitools',
      message: 'Project initialized sucessfully!',
      icon: Path.join(__dirname, '..', '..', 'assets', 'logo.png'),
      wait: false,
    })
  }
}
