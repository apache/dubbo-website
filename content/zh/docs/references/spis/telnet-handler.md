---
type: docs
title: "Telnet 命令扩展"
linkTitle: "Telnet 命令扩展"
weight: 20
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/spi/description/telnet-handler/)。
{{% /pageinfo %}}

## 扩展说明

所有服务器均支持 telnet 访问，用于人工干预。

## 扩展接口

`org.apache.dubbo.remoting.telnet.TelnetHandler`

## 扩展配置

```xml
<dubbo:protocol telnet="xxx,yyy" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置telnet属性时，使用此配置 -->
<dubbo:provider telnet="xxx,yyy" />
```

## 已知扩展

* `org.apache.dubbo.remoting.telnet.support.ClearTelnetHandler`
* `org.apache.dubbo.remoting.telnet.support.ExitTelnetHandler`
* `org.apache.dubbo.remoting.telnet.support.HelpTelnetHandler`
* `org.apache.dubbo.remoting.telnet.support.StatusTelnetHandler`
* `org.apache.dubbo.rpc.dubbo.telnet.ListTelnetHandler`
* `org.apache.dubbo.rpc.dubbo.telnet.ChangeTelnetHandler`
* `org.apache.dubbo.rpc.dubbo.telnet.CurrentTelnetHandler`
* `org.apache.dubbo.rpc.dubbo.telnet.InvokeTelnetHandler`
* `org.apache.dubbo.rpc.dubbo.telnet.TraceTelnetHandler`
* `org.apache.dubbo.rpc.dubbo.telnet.CountTelnetHandler`
* `org.apache.dubbo.rpc.dubbo.telnet.PortTelnetHandler`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTelnetHandler.java (实现TelnetHandler接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.telnet.TelnetHandler (纯文本文件，内容为：xxx=com.xxx.XxxTelnetHandler)
```

XxxTelnetHandler.java：

```java
package com.xxx;
 
import org.apache.dubbo.remoting.telnet.TelnetHandler;
 
@Help(parameter="...", summary="...", detail="...")
 
public class XxxTelnetHandler implements TelnetHandler {
    public String telnet(Channel channel, String message) throws RemotingException {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.telnet.TelnetHandler：

```properties
xxx=com.xxx.XxxTelnetHandler
```

## 用法

```sh
telnet 127.0.0.1 20880
dubbo> xxx args
```
