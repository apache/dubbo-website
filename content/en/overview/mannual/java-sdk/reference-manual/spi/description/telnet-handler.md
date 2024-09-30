---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/telnet-handler/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/telnet-handler/
description: Telnet Command Extension
linkTitle: Telnet Command Extension
title: Telnet Command Extension
type: docs
weight: 20
---






## Extension Description

All servers support telnet access for manual intervention.

## Extension Interface

`org.apache.dubbo.remoting.telnet.TelnetHandler`

## Extension Configuration

```xml
<dubbo:protocol telnet="xxx,yyy" />
<!-- Default value setting, when <dubbo:protocol> does not configure the telnet attribute, use this configuration -->
<dubbo:provider telnet="xxx,yyy" />
```

## Known Extensions

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

## Extension Example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTelnetHandler.java (implements TelnetHandler interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.telnet.TelnetHandler (plain text file, content: xxx=com.xxx.XxxTelnetHandler)
```

XxxTelnetHandler.java:

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

META-INF/dubbo/org.apache.dubbo.remoting.telnet.TelnetHandler:

```properties
xxx=com.xxx.XxxTelnetHandler
```

## Command Usage

```sh
telnet 127.0.0.1 20880
dubbo> xxx args
```
