> ![warning](../sources/images/check.gif)RMI协议采用JDK标准的java.rmi.*实现，采用阻塞式短连接和JDK标准序列化方式。

> ![warning](../sources/images/warning-3.gif)如果正在使用RMI提供服务给外部访问（公司内网环境应该不会有攻击风险），同时应用里依赖了老的common-collections包（dubbo不会依赖这个包，请排查自己的应用有没有使用）的情况下，存在反序列化安全风险。
> 
> 请检查应用：  
> * 将commons-collections3 请升级到 [3.2.2版本](https://commons.apache.org/proper/commons-collections/release_3_2_2.html)  
> * 将commons-collections4 请升级到 [4.1版本](https://commons.apache.org/proper/commons-collections/release_4_1.html)   
> 新版本的commons-collections解决了该问题

如果服务接口继承了java.rmi.Remote接口，可以和原生RMI互操作，即：

* 提供者用Dubbo的RMI协议暴露服务，消费者直接用标准RMI接口调用，
* 或者提供方用标准RMI暴露服务，消费方用Dubbo的RMI协议调用。

如果服务接口没有继承java.rmi.Remote接口

* 缺省Dubbo将自动生成一个com.xxx.XxxService$Remote的接口，并继承java.rmi.Remote接口，并以此接口暴露服务，
* 但如果设置了 `<dubbo:protocol name="rmi" codec="spring" />`，将不生成$Remote接口，而使用Spring的RmiInvocationHandler接口暴露服务，和Spring兼容。

定义 RMI 协议：

```xml
<dubbo:protocol name="rmi" port="1099" />
```

设置默认协议：

```xml
<dubbo:provider protocol="rmi" />
```

设置服务协议：

```xml
<dubbo:service protocol="rmi" />
```

多端口：

```xml
<dubbo:protocol id="rmi1" name="rmi" port="1099" />
<dubbo:protocol id="rmi2" name="rmi" port="2099" />
 
<dubbo:service protocol="rmi1" />
```

Spring 兼容性：

```xml
<dubbo:protocol name="rmi" codec="spring" />
```

Java标准的远程调用协议

* 连接个数：多连接
* 连接方式：短连接
* 传输协议：TCP
* 传输方式：同步传输
* 序列化：Java标准二进制序列化
* 适用范围：传入传出参数数据包大小混合，消费者与提供者个数差不多，可传文件。
* 适用场景：常规远程服务方法调用，与原生RMI服务互操作

(1) 约束：

* 参数及返回值需实现Serializable接口
* dubbo配置中的超时时间对rmi无效，需使用java启动参数设置：-Dsun.rmi.transport.tcp.responseTimeout=3000，参见下面的RMI配置

(2) 配置：

**dubbo.properties**

```
dubbo.service.protocol=rmi
```

(3) RMI配置：

```sh
java -Dsun.rmi.transport.tcp.responseTimeout=3000
```

更多RMI优化参数请查看：
http://download.oracle.com/docs/cd/E17409_01/javase/6/docs/technotes/guides/rmi/sunrmiproperties.html