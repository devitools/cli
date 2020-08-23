import {Command} from '@oclif/command'

import cli from 'cli-ux'
import * as notifier from 'node-notifier'
import * as Path from 'path'
import * as chalk from 'chalk'

/**
 * @class {Base}
 */
export default abstract class Base extends Command {
  /**
   */
  async welcome() {
    await cli.url('@devitools', 'https://devi.tools')
    await cli.annotation('# Welcome to devitools family!', 'https://devi.tools')
    this.log('--')
  }

  /**
   * @param {string} message
   * @param {string} fallback
   *
   * @return {Promise<string>}
   */
  async prompt(message: string, fallback: string): Promise<string> {
    const prompt = await cli.prompt(`${chalk.yellow('?')} ${message} [${fallback}]`, {required: false})
    if (!prompt) {
      return fallback
    }
    return String(prompt)
  }

  /**
   * @param {string} message
   */
  notify(message: string) {
    try {
      notifier.notify({
        message,
        title: 'Devitools',
        icon: Path.join(__dirname, '..', '..', 'assets', 'logo.png'),
        wait: false,
      })
    } catch (error) {
      // silent is gold
    }
  }
}
