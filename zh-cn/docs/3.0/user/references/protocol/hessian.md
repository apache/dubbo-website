# hessian://

Hessian [^1] 协议用于集成 Hessian 的服务，Hessian 底层采用 Http 通讯，采用 Servlet 暴露服务，Dubbo 缺省内嵌 Jetty 作为服务器实现。

Dubbo 的 Hessian 协议可以和原生 Hessian 服务互操作，即：

* 提供者用 Dubbo 的 Hessian 协议暴露服务，消费者直接用标准 Hessian 接口调用
* 或者提供方用标准 Hessian 暴露服务，消费方用 Dubbo 的 Hessian 协议调用。

## 特性

* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：Hessian二进制序列化
* 适用范围：传入传出参数数据包较大，提供者比消费者个数多，提供者压力较大，可传文件。
* 适用场景：页面传输，文件传输，或与原生hessian服务互操作

## 依赖

```xml
<dependency>
    <groupId>com.caucho</groupId>
    <artifactId>hessian</artifactId>
    <version>4.0.7</version>
</dependency>
```

## 约束

* 参数及返回值需实现 `Serializable` 接口
* 参数及返回值不能自定义实现 `List`, `Map`, `Number`, `Date`, `Calendar` 等接口，只能用 JDK 自带的实现，因为 hessian 会做特殊处理，自定义实现类中的属性值都会丢失。

## 配置

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

[^1]: [Hessian](http://hessian.caucho.com) 是 Caucho 开源的一个 RPC 框架，其通讯效率高于 WebService 和 Java 自带的序列化。
