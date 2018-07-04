# http://

基于 HTTP 表单的远程调用协议，采用 Spring 的 HttpInvoker 实现 [^1] 

## 特性

* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：表单序列化
* 适用范围：传入传出参数数据包大小混合，提供者比消费者个数多，可用浏览器查看，可用表单或URL传入参数，暂不支持传文件。
* 适用场景：需同时给应用程序和浏览器 JS 使用的服务。

## 约束  
* 参数及返回值需符合 Bean 规范

## 配置

配置协议：

```xml
<dubbo:protocol name="http" port="8080" />
```

配置 Jetty Server (默认)：

```xml
<dubbo:protocol ... server="jetty" />
```

配置 Servlet Bridge Server (推荐使用)：

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

[^1]: `2.3.0` 以上版本支持