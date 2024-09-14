---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/security/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/security/
description: 序列化安全审计
linkTitle: 序列化安全审计
title: 序列化安全审计
type: docs
weight: 9
---






Dubbo 支持通过 QoS 命令实时查看当前的配置信息以及可信/不可信类列表。目前共支持两个命令：`serializeCheckStatus` 查看当前配置信息，`serializeWarnedClasses` 查看实时的告警列表。

### `serializeCheckStatus` 命令

通过控制台直接访问：
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

通过 http 请求 json 格式结果：
```bash
> curl http://127.0.0.1:22222/serializeCheckStatus      
{"checkStatus":"WARN","allowedPrefix":[...],"checkSerializable":true,"disAllowedPrefix":[...]}
```

### `serializeWarnedClasses` 命令

通过控制台直接访问：
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

通过 http 请求 json 格式结果：
```bash
> curl http://127.0.0.1:22222/serializeWarnedClasses
{"warnedClasses":["io.dubbo.test2.NotSerializable","org.apache.dubbo.samples.NotSerializable","io.dubbo.test.NotSerializable","io.dubbo.test2.OthersSerializable"]}
```
{{% alert title="注意" color="primary" %}}
建议及时关注 `serializeWarnedClasses` 的结果，通过返回结果是否非空来判断是否受到攻击。

[Dubbo 类检查机制](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/security/class-check/)。
{{% /alert %}}
