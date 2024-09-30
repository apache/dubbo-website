---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/command/
    - /en/docs3-v2/java-sdk/reference-manual/qos/command/
description: Basic Command Manual
linkTitle: Basic Command Manual
title: Basic Command Manual
type: docs
weight: 2
---





The basic command functionality provides a set of fundamental commands.

### help command

Display more commands
```
// List all commands
dubbo>help

// List specific usage of a single command
dubbo>help online
+--------------+----------------------------------------------------------------------------------+
| COMMAND NAME | online                                                                           |
+--------------+----------------------------------------------------------------------------------+
|      EXAMPLE | online dubbo                                                                     |
|              | online xx.xx.xxx.service                                                         |
+--------------+----------------------------------------------------------------------------------+

dubbo>
```

### version command

Display the version number of the currently running Dubbo

```
dubbo>version
dubbo version "3.0.10-SNAPSHOT"

dubbo>
```

### quit command

Exit the command state

```
dubbo>quit
BYE!
Connection closed by foreign host.

```
