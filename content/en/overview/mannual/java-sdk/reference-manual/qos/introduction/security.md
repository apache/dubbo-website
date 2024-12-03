---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/security/
    - /en/docs3-v2/java-sdk/reference-manual/qos/security/
description: Serialization Security Audit
linkTitle: Serialization Security Audit
title: Serialization Security Audit
type: docs
weight: 9
---






Dubbo supports real-time viewing of current configuration information and the list of trusted/untrusted classes through QoS commands. Currently, two commands are supported: `serializeCheckStatus` to view current configuration information, and `serializeWarnedClasses` to view the real-time warning list.

### `serializeCheckStatus` Command

Access directly through the console:
```bash
> telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
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

By HTTP request for JSON format results:
```bash
> curl http://127.0.0.1:22222/serializeCheckStatus      
{"checkStatus":"WARN","allowedPrefix":[...],"checkSerializable":true,"disAllowedPrefix":[...]}
```

### `serializeWarnedClasses` Command

Access directly through the console:
```bash
> telnet 127.0.0.1 22222                          
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>serializeWarnedClasses
WarnedClasses: 
io.dubbo.test.NotSerializable
io.dubbo.test2.NotSerializable
io.dubbo.test2.OthersSerializable
org.apache.dubbo.samples.NotSerializable


dubbo>
```

By HTTP request for JSON format results:
```bash
> curl http://127.0.0.1:22222/serializeWarnedClasses
{"warnedClasses":["io.dubbo.test2.NotSerializable","org.apache.dubbo.samples.NotSerializable","io.dubbo.test.NotSerializable","io.dubbo.test2.OthersSerializable"]}
```
{{% alert title="Note" color="primary" %}}
It is recommended to pay attention to the results of `serializeWarnedClasses` promptly and determine if an attack is occurring by checking whether the returned result is non-empty.

[Dubbo Class Check Mechanism](/en/overview/mannual/java-sdk/advanced-features-and-usage/security/class-check/)。
{{% /alert %}}

