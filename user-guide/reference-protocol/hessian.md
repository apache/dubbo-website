> ![warning](../sources/images/check.gif)Hessian协议用于集成Hessian的服务，Hessian底层采用Http通讯，采用Servlet暴露服务，Dubbo缺省内嵌Jetty作为服务器实现。

> ![warning](../sources/images/check.gif)[Hessian](http://hessian.caucho.com) 是Caucho开源的一个 RPC 框架，其通讯效率高于WebService和Java自带的序列化。

依赖：

```xml
<dependency>
    <groupId>com.caucho</groupId>
    <artifactId>hessian</artifactId>
    <version>4.0.7</version>
</dependency>
```

可以和原生Hessian服务互操作，即：

* 提供者用Dubbo的Hessian协议暴露服务，消费者直接用标准Hessian接口调用，
* 或者提供方用标准Hessian暴露服务，消费方用Dubbo的Hessian协议调用。

基于Hessian的远程调用协议。

* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：Hessian二进制序列化
* 适用范围：传入传出参数数据包较大，提供者比消费者个数多，提供者压力较大，可传文件。
* 适用场景：页面传输，文件传输，或与原生hessian服务互操作

(1) 约束：

* 参数及返回值需实现Serializable接口
* 参数及返回值不能自定义实现List, Map, Number, Date, Calendar等接口，只能用JDK自带的实现，因为hessian会做特殊处理，自定义实现类中的属性值都会丢失。

(2) 配置：

定义 hessian 协议：

```xml
<dubbo:protocol name="hessian" port="8080" server="jetty" />
```

设置默认协议：

```xml
<dubbo:provider protocol="hessian" />
```

设置 service 协议：

```xml
<dubbo:service protocol="hessian" />
```

多端口：

```xml
<dubbo:protocol id="hessian1" name="hessian" port="8080" />
<dubbo:protocol id="hessian2" name="hessian" port="8081" />
```

直连：

```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="hessian://10.20.153.10:8080/helloWorld" />
```

