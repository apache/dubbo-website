# Telnet 命令扩展

## 扩展说明

所有服务器均支持 telnet 访问，用于人工干预。

## 扩展接口

`com.alibaba.dubbo.remoting.telnet.TelnetHandler`

## 扩展配置

```xml
<dubbo:protocol telnet="xxx,yyy" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置telnet属性时，使用此配置 -->
<dubbo:provider telnet="xxx,yyy" />
```

## 已知扩展

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
                |-com.alibaba.dubbo.remoting.telnet.TelnetHandler (纯文本文件，内容为：xxx=com.xxx.XxxTelnetHandler)
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
