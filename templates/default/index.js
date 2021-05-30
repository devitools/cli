const Path = require('path')

/**
 * @param command
 * @param target
 * @param entity
 * @param domain
 * @param parameters
 */
module.exports = async function (command, target, entity, domain, parameters) {
  const templateSettings = {
    front: {
      type: ['quasar'], // ['quasar', 'vuetify', 'material-ui']
      root: 'front',
      domains: Path.join('source', 'domains'),
      views: Path.join('resources', 'views'),
      i18n: Path.join('resources', 'lang'),
    },
    back: {
      type: ['laravel'], // ['laravel', 'symfony']
      root: 'back',
      domains: Path.join('Domains'),
      controller: Path.join('Http', 'Controllers'),
      migration: Path.join('migrations'),
    },
  }

  const lower = domain.map(entry => entry.toLowerCase())

  const pad = input => input < 10 ? '0' + input : input
  const date = new Date()
  const timestamp = date.getFullYear().toString() + '_' +
    pad(date.getMonth() + 1) + '_' +
    pad(date.getDate()) + '_' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())

  const replaces = {
    namespace: domain.map(entry => command.toCamelCase(entry, true)).join('\\'),
    domain: domain.map(entry => command.toCamelCase(entry, true)).join('/'),
    'domain.lower': lower.join('/'),
    entity: command.toCamelCase(entity, true),
    'entity.lower': entity.toLowerCase(),
    'entity.icon': '',
    'entity.collection': '',
    'migration.file': '',
    'migration.class': '',
    parameters,
  }

  if (target.front.type) {
    const frontType = target.front.type
    const templateFront = Path.join(__dirname, templateSettings.front.root, frontType)
    const targetFront = Path.join(process.cwd(), target.front.root)

    const plural = await command.prompt('  Label used on plural names (permissions, menu, breadcrumbs)', '')
    const singular = await command.prompt('  Label used on singular names (breadcrumbs)', '')

    replaces['entity.icon'] = await command.prompt('  Icon used on the interface', 'folder')
    replaces['entity.plural'] = plural || '[[entity.plural]]'
    replaces['entity.singular'] = singular || '[[entity.singular]]'

    const filter = (parameters.builtin || parameters.array) ? [new RegExp('({{entity}}Schema|settings).*')] : []
    await command.generate(
      Path.join(templateFront, templateSettings.front.domains),
      Path.join(targetFront, target.front.domains),
      replaces,
      filter
    )
    await command.generate(
      Path.join(templateFront, templateSettings.front.views),
      Path.join(targetFront, target.front.views),
      replaces
    )
    await command.generate(
      Path.join(templateFront, templateSettings.front.i18n),
      Path.join(targetFront, target.front.i18n),
      replaces
    )
  }

  if (target.back.type) {
    const backType = target.back.type
    const templateBack = Path.join(__dirname, templateSettings.back.root, backType)
    const targetBack = Path.join(process.cwd(), target.back.root)

    const collection = await command.prompt('  Table or collection:', command.pluralize(entity.replace(/[^a-zA-Z0-9]/g, '_')))

    replaces['entity.collection'] = collection
    replaces['migration.file'] = `${timestamp}_${command.toDashCase(collection)}_create`
    replaces['migration.class'] = `${command.toCamelCase(collection, true)}Create`

    await command.generate(
      Path.join(templateBack, templateSettings.back.domains),
      Path.join(targetBack, target.back.domains),
      replaces
    )
    await command.generate(
      Path.join(templateBack, templateSettings.back.controller),
      Path.join(targetBack, target.back.controller),
      replaces
    )
    await command.generate(
      Path.join(templateBack, templateSettings.back.migration),
      Path.join(targetBack, target.back.migration),
      replaces
    )
  }

  command.log('All done\n')
}
