@devitools/cli
===

Command line devitools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cli.svg)](https://npmjs.org/package/cli)
[![Downloads/week](https://img.shields.io/npm/dw/cli.svg)](https://npmjs.org/package/cli)
[![License](https://img.shields.io/npm/l/cli.svg)](https://github.com/devitools/cli/blob/master/package.json)

<div align="center">
  <img alt="Devitools logo" src="https://devi.tools/images/logo-horizontal.png" />
</div>
<br>
<br>


<p align="center">
  <a href="#" style="text-decoration: none">
    <img alt="License" src="https://img.shields.io/github/license/devitools/cli?color=34CB79" />
  </a>
  <a href="https://github.com/devitools/cli/issues" style="text-decoration: none" target="_blank">
    <img alt="Issues" src="https://img.shields.io/github/issues/devitools/cli?color=34CB79" />
  </a>
    <a href="https://github.com/devitools/cli/graphs/contributors" style="text-decoration: none" target="_blank">
    <img src="https://img.shields.io/github/contributors/devitools/cli?color=34CB79" />
  </a>
  <a href="#" style="text-decoration: none">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/devitools/cli?color=34CB79" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/devitools/cli/stargazers" style="text-decoration: none" target="_blank">
    <img alt="Github Stars" src="https://img.shields.io/github/stars/devitools/cli?style=social" />
  </a>
  <a href="https://github.com/devitools/cli/network/members" style="text-decoration: none" target="_blank">
    <img alt="Github Forks" src="https://img.shields.io/github/forks/devitools/cli?style=social" />
  </a>
  <a href="https://twitter.com/devitools" style="text-decoration: none" target="_blank">
    <img alt="Twitter" src="https://img.shields.io/twitter/follow/devitools?label=Twitter&style=social" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/devitools/cli/tags" style="text-decoration: none" target="_blank">
    <img alt="Github Tags" src="https://img.shields.io/github/v/tag/devitools/cli.svg?logo=github" />
  </a>
  <a href="https://github.com/devitools/cli/releases" style="text-decoration: none" target="_blank">
    <img alt="Github Releases" src="https://img.shields.io/github/last-commit/devitools/cli.svg?label=Updated&logo=github&maxAge=600" />
  </a>
</p>

<!-- toc -->
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
@devitools/cli/0.9.0 win32-x64 node-v12.18.4
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
* [`devi create FOLDER [REPO]`](#devi-create-folder-repo)
* [`devi env`](#devi-env)
* [`devi help [COMMAND]`](#devi-help-command)
* [`devi init`](#devi-init)
* [`devi pull`](#devi-pull)
* [`devi update [CHANNEL]`](#devi-update-channel)

## `devi add DOMAIN`

initialize a directory to be recognized as a devitools project

```
USAGE
  $ devi add DOMAIN

ARGUMENTS
  DOMAIN  the domain that will be created

OPTIONS
  -g, --group
  -h, --help                   show CLI help
  -o, --override
  -p, --parameters=parameters
  -t, --template=template

EXAMPLES
  $ devi add general --group | devi add general -g // create new namespace without schemas
  $ devi add main.category // add a new entity Category namespaced by Main
  $ devi add financial.bank-account // use kebab case
  $ devi add main.company.partners // use dot notation to nested items
  $ devi add foo.bar -o | devi add foo.bar --override // override all without ask
  $ devi add foo.bar -t=my-template // use a custom template (the default value is default)
  $ devi add foo.bar --template=my-template // use a custom template (the default value is default)
  $ devi add foo.bar -p=whatever | devi add foo.bar --parameters=whatever
  * special parameters:
     - devi add foo.bar -p=array
     - devi add foo.bar -p=builtin
  * JSON support:
     - devi add foo.bar -p={"foo":"bar"}
```

_See code: [src/commands/add.ts](https://github.com/devitools/cli/blob/v0.9.0/src/commands/add.ts)_

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

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.2.1/src/commands/autocomplete/index.ts)_

## `devi create FOLDER [REPO]`

create a new devitools project

```
USAGE
  $ devi create FOLDER [REPO]

ARGUMENTS
  FOLDER  [default: devitools] the name of the new project folder
  REPO    [default: https://github.com/devitools/starter-kit.git] repository base to create the new project

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ devi create <name>
```

_See code: [src/commands/create.ts](https://github.com/devitools/cli/blob/v0.9.0/src/commands/create.ts)_

## `devi env`

update the devitools resources

```
USAGE
  $ devi env

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ devi env
```

_See code: [src/commands/env.ts](https://github.com/devitools/cli/blob/v0.9.0/src/commands/env.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `devi init`

initialize a directory to be recognized as a devitools project

```
USAGE
  $ devi init

OPTIONS
  -b, --back
  -f, --front
  -h, --help   show CLI help

EXAMPLES
  $ devi init
  $ devi init -f | devi init --front // init a project with just frontend
  $ devi init -b | devi init --back // init a project with just backend
```

_See code: [src/commands/init.ts](https://github.com/devitools/cli/blob/v0.9.0/src/commands/init.ts)_

## `devi pull`

update the devitools resources

```
USAGE
  $ devi pull

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ devi pull
```

_See code: [src/commands/pull.ts](https://github.com/devitools/cli/blob/v0.9.0/src/commands/pull.ts)_

## `devi update [CHANNEL]`

update the devi CLI

```
USAGE
  $ devi update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.10/src/commands/update.ts)_
<!-- commandsstop -->
