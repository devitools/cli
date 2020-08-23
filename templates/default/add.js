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
    pad(date.getMonth() + 1) +  '_' +
    pad(date.getDate()) +  '_' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())

  const replaces = {
    namespace: domain.map(entry => command.toCamelCase(entry, true)).join('\\'),
    domain: domain.map(entry => command.toCamelCase(entry, true)).join('/'),
    'domain.lower': lower.join('/'),
    'domain.dotted': lower.join('.'),
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

    replaces['entity.icon'] = await command.prompt('  Icon used on the interface', 'folder')

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
      Path.join(__dirname, 'lang'),
      Path.join(targetFront, target.front.domains, replaces.domain, replaces.entity),
      replaces,
      target.lang.map(lang => new RegExp(`${lang}.*`))
    )
  }

  if (target.back.type) {
    const backType = target.front.type
    const templateBack = Path.join(__dirname, templateSettings.back.root, backType)
    const targetBack = Path.join(process.cwd(), target.back.root)

    const collection = await command.prompt('  Table or collection:', command.pluralize(entity))

    replaces['entity.collection'] = collection
    replaces['migration.file'] = `${timestamp}_${command.toCamelCase(collection)}-create`
    replaces['migration.class'] = `${command.toCamelCase(collection)}Create`

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

  command.log('Domain created successfully\n')
  command.notify('Domain created successfully')
}
