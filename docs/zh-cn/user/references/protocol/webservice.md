# webservice://

基于 WebService 的远程调用协议，基于 [Apache CXF](http://cxf.apache.org) [^1] 的 `frontend-simple` 和 `transports-http` 实现 [^2]。

可以和原生 WebService 服务互操作，即：
  
* 提供者用 Dubbo 的 WebService 协议暴露服务，消费者直接用标准 WebService 接口调用，
* 或者提供方用标准 WebService 暴露服务，消费方用 Dubbo 的 WebService 协议调用。  

## 依赖

```xml
<dependency>
    <groupId>org.apache.cxf</groupId>
    <artifactId>cxf-rt-frontend-simple</artifactId>
    <version>2.6.1</version>
</dependency>
<dependency>
    <groupId>org.apache.cxf</groupId>
    <artifactId>cxf-rt-transports-http</artifactId>
    <version>2.6.1</version>
</dependency>
```

## 特性
 
* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：SOAP 文本序列化
* 适用场景：系统集成，跨语言调用

## 约束
  
* 参数及返回值需实现 `Serializable` 接口
* 参数尽量使用基本类型和 POJO

## 配置
  
配置协议：

```xml
<dubbo:protocol name="webservice" port="8080" server="jetty" />
```

配置默认协议：

```xml
<dubbo:provider protocol="webservice" />
```

配置服务协议：

```xml
<dubbo:service protocol="webservice" />
```

多端口：

```xml
<dubbo:protocol id="webservice1" name="webservice" port="8080" />
<dubbo:protocol id="webservice2" name="webservice" port="8081" />
```

直连：

```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="webservice://10.20.153.10:8080/com.foo.HelloWorld" />
```

WSDL：

```
http://10.20.153.10:8080/com.foo.HelloWorld?wsdl
```

Jetty Server (默认)：

```xml
<dubbo:protocol ... server="jetty" />
```
 
Servlet Bridge Server (推荐)：  

```xml
<dubbo:protocol ... server="servlet" />
```

配置 DispatcherServlet：
 
```xml
<servlet>
         <servlet-name>dubbo</servlet-name>
         <servlet-class>com.alibaba.dubbo.remoting.http.servlet.DispatcherServlet</servlet-class>
         <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
         <servlet-name>dubbo</servlet-name>
         <url-pattern>/*</url-pattern>
</servlet-mapping>
```

注意，如果使用 servlet 派发请求：  

* 协议的端口 `<dubbo:protocol port="8080" />` 必须与 servlet 容器的端口相同，
* 协议的上下文路径 `<dubbo:protocol contextpath="foo" />` 必须与 servlet 应用的上下文路径相同。

[^1]: CXF 是 Apache 开源的一个 RPC 框架，由 Xfire 和 Celtix 合并而来  
[^2]: `2.3.0` 以上版本支持
