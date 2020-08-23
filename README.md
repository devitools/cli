@devitools/cli
===

Command line devitools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cli.svg)](https://npmjs.org/package/cli)
[![Downloads/week](https://img.shields.io/npm/dw/cli.svg)](https://npmjs.org/package/cli)
[![License](https://img.shields.io/npm/l/cli.svg)](https://github.com/devitools/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @devitools/cli
$ devi COMMAND
running command...
$ devi (-v|--version|version)
@devitools/cli/0.4.0 win32-x64 node-v12.18.2
$ devi --help [COMMAND]
USAGE
  $ devi COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g @devitools/cli

$ devi COMMAND
running command...

$ devi (-v|--version|version)
devi/0.0.0 win32-x64 node-v12.18.1

$ devi --help [COMMAND]
USAGE
  $ devi COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`devi add DOMAIN`](#devi-add-domain)
* [`devi autocomplete [SHELL]`](#devi-autocomplete-shell)
* [`devi help [COMMAND]`](#devi-help-command)
* [`devi init`](#devi-init)

## `devi add DOMAIN`

initialize a directory to be recognized as a devitools project

```
USAGE
  $ devi add DOMAIN

ARGUMENTS
  DOMAIN  the domain that will be created

OPTIONS
  -h, --help                   show CLI help
  -o, --override
  -p, --parameters=parameters
  -t, --template=template

EXAMPLES
  $ devi add foo.bar
  $ devi add foo.bar --override | devi add foo.bar --o
  $ devi add foo.bar --template=my-template | devi add foo.bar -t=my-template
```

_See code: [src\commands\add.ts](https://github.com/devitools/cli/blob/v0.4.0/src\commands\add.ts)_

## `devi autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ devi autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ devi autocomplete
  $ devi autocomplete bash
  $ devi autocomplete zsh
  $ devi autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.2.0/src\commands\autocomplete\index.ts)_

## `devi help [COMMAND]`

display help for devi

```
USAGE
  $ devi help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src\commands\help.ts)_

## `devi init`

Initialize a directory to be recognized as a devitools project

```
USAGE
  $ devi init

OPTIONS
  -b, --back
  -f, --front
  -h, --help   show CLI help

EXAMPLES
  $ devi init
  $ devi init -s
  $ devi init -b
```

_See code: [src\commands\init.ts](https://github.com/devitools/cli/blob/v0.4.0/src\commands\init.ts)_
<!-- commandsstop -->
* [`devi init`](#devi-init)
* [`devi help [COMMAND]`](#devi-help-command)

## `devi init`

initialize a directory to be recognized as a devitools project

```
USAGE
  $ devi init

OPTIONS
  -h, --help       show CLI help
  -m, --monorepo   initialize a project as a monorepo

EXAMPLE
  $ devi init
```

_See code: [src\commands\init.ts](https://github.com/devitools/cli/blob/master/src/commands/init.ts)_

## `devi help [COMMAND]`

display help for devi

```
USAGE
  $ devi help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src\commands\help.ts)_
<!-- commandsstop -->
