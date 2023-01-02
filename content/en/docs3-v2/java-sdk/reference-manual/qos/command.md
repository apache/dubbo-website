---
type: docs
title: "Basic Command Manual"
linkTitle: "Basic command manual"
weight: 2
description: "Basic command manual"
---


## help command

```
// list all commands
dubbo>help

//List the specific usage of a single command
dubbo>help online
+--------------+---------------------------------- ------------------------------------------------+
| COMMAND NAME | online |
+--------------+---------------------------------- ------------------------------------------------+
| EXAMPLE | online dubbo |
| | online xx.xx.xxx.service |
+--------------+---------------------------------- ------------------------------------------------+

dubbo>
```

## version command

Display the version number of the currently running Dubbo

```
dubbo>version
dubbo version "3.0.10-SNAPSHOT"

dubbo>
```

## quit command

exit command state

```
dubbo>quit
BYE!
Connection closed by foreign host.

```