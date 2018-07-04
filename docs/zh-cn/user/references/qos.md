



# 新版本 telnet 命令使用说明

dubbo 2.5.8 新版本重构了 telnet 模块，提供了新的 telnet 命令支持。

### 端口
新版本的 telnet 端口 与 dubbo 协议的端口是不同的端口，默认为 `22222`，可通过配置文件`dubbo.properties` 修改:

```
dubbo.application.qos.port=33333
```

或者通过设置 JVM 参数:

```
-Ddubbo.application.qos.port=33333
```

### 安全

默认情况下，dubbo 接收任何主机发起的命令，可通过配置文件`dubbo.properties` 修改:

```
dubbo.application.qos.accept.foreign.ip=false
```

或者通过设置 JVM 参数:

```
-Ddubbo.application.qos.accept.foreign.ip=false
```

拒绝远端主机发出的命令，只允许服务本机执行


### telnet 与 http 协议

telnet 模块现在同时支持 http 协议和 telnet 协议，方便各种情况的使用

示例如下：

```
➜  ~ telnet localhost 22222
Trying ::1...
telnet: connect to address ::1: Connection refused
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
  ████████▄  ███    █▄  ▀█████████▄  ▀█████████▄   ▄██████▄
  ███   ▀███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███   ███    ███   ███    ███ ███    ███
  ███    ███ ███    ███  ▄███▄▄▄██▀   ▄███▄▄▄██▀  ███    ███
  ███    ███ ███    ███ ▀▀███▀▀▀██▄  ▀▀███▀▀▀██▄  ███    ███
  ███    ███ ███    ███   ███    ██▄   ███    ██▄ ███    ███
  ███   ▄███ ███    ███   ███    ███   ███    ███ ███    ███
  ████████▀  ████████▀  ▄█████████▀  ▄█████████▀   ▀██████▀


dubbo>ls
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|com.alibaba.dubbo.demo.DemoService| N |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+

dubbo>
```


```
➜  ~ curl "localhost:22222/ls?arg1=xxx&arg2=xxxx"
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|com.alibaba.dubbo.demo.DemoService| N |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```

### ls 列出消费者和提供者

```
dubbo>ls
As Provider side:
+----------------------------------+---+
|       Provider Service Name      |PUB|
+----------------------------------+---+
|com.alibaba.dubbo.demo.DemoService| Y |
+----------------------------------+---+
As Consumer side:
+---------------------+---+
|Consumer Service Name|NUM|
+---------------------+---+
```

列出 dubbo 的所提供的服务和消费的服务，以及消费的服务地址数

### Online 上线服务命令

当使用延迟发布功能的时候(通过设置 com.alibaba.dubbo.config.AbstractServiceConfig#register 为 false)，后续需要上线的时候，可通过 Online 命令

```
//上线所有服务
dubbo>online
OK

//根据正则，上线部分服务
dubbo>online com.*
OK
```

常见使用场景：

 - 当线上的 QPS 比较高的时候，当刚重启机器的时候，由于没有进行JIT 预热或相关资源没有预热，可能会导致大量超时，这个时候，可通过分批发布服务，逐渐加大流量
 - 当由于某台机器由于某种原因，需要下线服务，然后又需要重新上线服务



### Offline 下线服务命令

由于故障等原因，需要临时下线服务保持现场，可以使用 Offline 下线命令。


```
//下线所有服务
dubbo>offline
OK

//根据正则，下线部分服务
dubbo>offline com.*
OK
```

### help 命令



```
//列出所有命令
dubbo>help

//列出单个命令的具体使用情况
dubbo>help online
+--------------+----------------------------------------------------------------------------------+
| COMMAND NAME | online                                                                           |
+--------------+----------------------------------------------------------------------------------+
|      EXAMPLE | online dubbo                                                                     |
|              | online xx.xx.xxx.service                                                         |
+--------------+----------------------------------------------------------------------------------+

dubbo>
```


