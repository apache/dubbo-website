> ![warning](../sources/images/check.gif) 采用Spring的HttpInvoker实现  

> ![warning](../sources/images/warning-3.gif) 2.3.0以上版本支持

基于http表单的远程调用协议。参见：[HTTP协议使用说明](#)
* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：表单序列化
* 适用范围：传入传出参数数据包大小混合，提供者比消费者个数多，可用浏览器查看，可用表单或URL传入参数，暂不支持传文件。
* 适用场景：需同时给应用程序和浏览器JS使用的服务。

(1) 约束：  
* 参数及返回值需符合Bean规范

(2) 配置：
dubbo.xml：
```xml
<dubbo:protocol name="http" port="8080" />
```

h4. Jetty Server: (default)
```xml
<dubbo:protocol ... server="jetty" />
```

h4. Servlet Bridge Server: (recommend)
```xml
<dubbo:protocol ... server="servlet" />
```

web.xml：
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

注意，如果使用servlet派发请求：
* 协议的端口<dubbo:protocol port="8080" />必须与servlet容器的端口相同，
* 协议的上下文路径<dubbo:protocol contextpath="foo" />必须与servlet应用的上下文路径相同。