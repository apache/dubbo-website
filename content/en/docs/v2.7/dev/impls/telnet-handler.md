---
type: docs
title: "TelnetHandler Extension"
linkTitle: "TelnetHandler"
weight: 20
---


## Summary

Extension to telnet command. All server should support telnet access for operation convenience.

## Extension Interface

`org.apache.dubbo.remoting.telnet.TelnetHandler`

## Extension Configuration

```xml
<dubbo:protocol telnet="xxx,yyy" />
<!-- default configuration, will take effect if telnet attribute is not specified in <dubbo:protocol> -->
<dubbo:provider telnet="xxx,yyy" />
```

## Existing Extension

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

## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxTelnetHandler.java (TelnetHandler implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.remoting.telnet.TelnetHandler (plain text file with the content: xxx=com.xxx.XxxTelnetHandler)
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

## How To Use

```sh
telnet 127.0.0.1 20880
dubbo> xxx args
```
