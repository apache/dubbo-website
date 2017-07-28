> ![warning](../sources/images/warning-3.gif) 2.3.0以上版本支持。  

> ![check](../sources/images/check.gif) 基于CXF的frontend-simple和transports-http实现。  

> ![check](../sources/images/check.gif) CXF是Apache开源的一个RPC框架：http://cxf.apache.org，由Xfire和Celtix合并而来 。  

依赖：
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
可以和原生WebService服务互操作，即：  
* 提供者用Dubbo的WebService协议暴露服务，消费者直接用标准WebService接口调用，
* 或者提供方用标准WebService暴露服务，消费方用Dubbo的WebService协议调用。

基于WebService的远程调用协议:  
* 连接个数：多连接
* 连接方式：短连接
* 传输协议：HTTP
* 传输方式：同步传输
* 序列化：SOAP文本序列化
* 适用场景：系统集成，跨语言调用。

(1) 约束：  
* 参数及返回值需实现Serializable接口
* 参数尽量使用基本类型和POJO。

(2) 配置：  
* Define hessian protocol:
<dubbo:protocol name="webservice" port="8080" server="jetty" />

* Set default protocol:
```xml
<dubbo:provider protocol="webservice" />
```
Set service protocol:
```xml
<dubbo:service protocol="webservice" />
```
* Multi port:
```xml
<dubbo:protocol id="webservice1" name="webservice" port="8080" />
<dubbo:protocol id="webservice2" name="webservice" port="8081" />
```
* Directly provider:
```xml
<dubbo:reference id="helloService" interface="HelloWorld" url="webservice://10.20.153.10:8080/com.foo.HelloWorld" />
```
* WSDL:
```xml
http://10.20.153.10:8080/com.foo.HelloWorld?wsdl
```
**h4. Jetty Server: (default)**  
```xml
<dubbo:protocol ... server="jetty" />
```
 
**h4. Servlet Bridge Server: (recommend)**  
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
