---
type: docs
title: "Serialization Security Audit"
linkTitle: "Serialization Security Audit"
weight: 9
description: "Serialization Security Audit"
---

Dubbo supports real-time viewing of current configuration information and trusted/untrusted class lists through QoS commands. Currently supports two commands: `serializeCheckStatus` to view the current configuration information, `serializeWarnedClasses` to view the real-time alarm list.

### `serializeCheckStatus` command

Access directly through the console:
```bash
> telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___ __ __ ___ ___ ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _ |/ _ |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>serializeCheckStatus
CheckStatus: WARN

CheckSerializable: true

AllowedPrefix:
...

DisAllowedPrefix:
...


dubbo>
```

Request the result in json format via http:
```bash
> curl http://127.0.0.1:22222/serializeCheckStatus
{"checkStatus": "WARN","allowedPrefix":[...],"checkSerializable":true,"disAllowedPrefix":[...]}
```

### `serializeWarnedClasses` command

Access directly through the console:
```bash
> telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___ __ __ ___ ___ ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _ |/ _ |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>serializeWarnedClasses
Warned Classes:
io.dubbo.test.NotSerializable
io.dubbo.test2.NotSerializable
io.dubbo.test2.OthersSerializable
org.apache.dubbo.samples.NotSerializable


dubbo>
```

Request the result in json format via http:
```bash
> curl http://127.0.0.1:22222/serializeWarnedClasses
{"warnedClasses":["io.dubbo.test2.NotSerializable","org.apache.dubbo.samples.NotSerializable","io.dubbo.test.NotSerializable","io.dubbo.test2.OthersSerializable"]}
```

Note: It is recommended to pay attention to the result of `serializeWarnedClasses` in time, and judge whether it is attacked by whether the returned result is not empty.

> For more configuration details, please refer to [Dubbo Class Check Mechanism](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/security/class-check/).
