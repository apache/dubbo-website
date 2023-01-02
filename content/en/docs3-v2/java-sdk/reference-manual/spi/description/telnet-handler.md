---
type: docs
title: "Telnet Command Extensions"
linkTitle: "Telnet command extension"
weight: 20
---

## Expansion Description

All servers support telnet access for manual intervention.

## Extension ports

`org.apache.dubbo.remoting.telnet.TelnetHandler`

## Extended configuration

```xml
<dubbo:protocol telnet="xxx,yyy" />
<!-- The default value setting, when <dubbo:protocol> does not configure the telnet attribute, use this configuration -->
<dubbo:provider telnet="xxx,yyy" />
```

## Known extensions

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

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTelnetHandler.java (implement TelnetHandler interface)
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
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.remoting.telnet.TelnetHandler:

```properties
xxx=com.xxx.XxxTelnetHandler
```

## Usage

```sh
telnet 127.0.0.1 20880
dubbo> xxx args
```