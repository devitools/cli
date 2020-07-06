cli
===

Command line devitools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cli.svg)](https://npmjs.org/package/cli)
[![Downloads/week](https://img.shields.io/npm/dw/cli.svg)](https://npmjs.org/package/cli)
[![License](https://img.shields.io/npm/l/cli.svg)](https://github.com/wilcorrea/cli/blob/master/package.json)

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
devi/0.0.0 win32-x64 node-v12.18.1

$ devi --help [COMMAND]
USAGE
  $ devi COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`devi hello [FILE]`](#devi-hello-file)
* [`devi help [COMMAND]`](#devi-help-command)

## `devi hello [FILE]`

describe the command here

```
USAGE
  $ devi init

OPTIONS
  -h, --help       show CLI help
  -m, --monorepo   initialize a project as a monorepo

EXAMPLE
  $ devi init
```

_See code: [src\commands\hello.ts](https://github.com/wilcorrea/cli/blob/v0.0.0/src\commands\hello.ts)_

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
