在开发及测试环境下，经常需要绕过注册中心，只测试指定服务提供者，这时候可能需要点对点直连，点对点直联方式，将以服务接口为单位，忽略注册中心的提供者列表，A接口配置点对点，不影响B接口从注册中心获取列表。

![/user-guide/images/dubbo-directly.jpg](../sources/images/dubbo-directly.jpg)

* 如果是线上需求需要点对点，可在 `<dubbo:reference>` 中配置url指向提供者，将绕过注册中心，多个地址用分号隔开，配置如下：
    > 1.0.6及以上版本支持

    ```xml
    <dubbo:reference id="xxxService" interface="com.alibaba.xxx.XxxService" url="dubbo://localhost:20890" />
    ```
    
* 在JVM启动参数中加入-D参数映射服务地址，如：

    > key为服务名，value为服务提供者url，此配置优先级最高，1.0.15及以上版本支持

    ```sh
    java -Dcom.alibaba.xxx.XxxService=dubbo://localhost:20890
    ```

* 如果服务比较多，也可以用文件映射，如：

    > 用-Ddubbo.resolve.file指定映射文件路径，此配置优先级高于`<dubbo:reference>`中的配置，1.0.15及以上版本支持
    > 2.0以上版本自动加载${user.home}/dubbo-resolve.properties文件，不需要配置

    ```sh
    java -Ddubbo.resolve.file=xxx.properties
    ```
    
    然后在映射文件xxx.properties中加入：(key为服务名，value为服务提供者url)
    
    ```sh
    com.alibaba.xxx.XxxService=dubbo://localhost:20890
    ```
    
> **![warning](../sources/images/check.gif)注意**  
> 为了避免复杂化线上环境，不要在线上使用这个功能，只应在测试阶段使用。