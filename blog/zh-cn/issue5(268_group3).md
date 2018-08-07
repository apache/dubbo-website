## provider宕机之后，consumer在心跳包超时之后直接关闭连接

具体配置如下

```xml
<dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.demo.DemoService">
    <dubbo:parameter key="heartbeat.reconnect" value="false"/>
</dubbo:reference>
```
