# TelnetHandler Extension

## Summary

Extension to telnet command. All server should support telnet access for operation convenience.

## Extension Interface

`com.alibaba.dubbo.remoting.telnet.TelnetHandler`

## Extension Configuration

```xml
<dubbo:protocol telnet="xxx,yyy" />
<!-- default configuration, will take effect if telnet attribute is not specified in <dubbo:protocol> -->
<dubbo:provider telnet="xxx,yyy" />
```

## Existing Extension

* `com.alibaba.dubbo.remoting.telnet.support.ClearTelnetHandler`
* `com.alibaba.dubbo.remoting.telnet.support.ExitTelnetHandler`
* `com.alibaba.dubbo.remoting.telnet.support.HelpTelnetHandler`
* `com.alibaba.dubbo.remoting.telnet.support.StatusTelnetHandler`
* `com.alibaba.dubbo.rpc.dubbo.telnet.ListTelnetHandler`
* `com.alibaba.dubbo.rpc.dubbo.telnet.ChangeTelnetHandler`
* `com.alibaba.dubbo.rpc.dubbo.telnet.CurrentTelnetHandler`
* `com.alibaba.dubbo.rpc.dubbo.telnet.InvokeTelnetHandler`
* `com.alibaba.dubbo.rpc.dubbo.telnet.TraceTelnetHandler`
* `com.alibaba.dubbo.rpc.dubbo.telnet.CountTelnetHandler`
* `com.alibaba.dubbo.rpc.dubbo.telnet.PortTelnetHandler`

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
                |-com.alibaba.dubbo.remoting.telnet.TelnetHandler (plain text file with the content: xxx=com.xxx.XxxTelnetHandler)
```

XxxTelnetHandler.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.remoting.telnet.TelnetHandler;
 
@Help(parameter="...", summary="...", detail="...")
 
public class XxxTelnetHandler implements TelnetHandler {
    public String telnet(Channel channel, String message) throws RemotingException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.remoting.telnet.TelnetHandler：

```properties
xxx=com.xxx.XxxTelnetHandler
```

## 用法

```sh
telnet 127.0.0.1 20880
dubbo> xxx args
```
