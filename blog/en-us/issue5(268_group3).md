## When provider shutdown, consumer reconnect directly after heartbeat timeout

for example

```xml
<dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.demo.DemoService">
    <dubbo:parameter key="heartbeat.reconnect" value="false"/>
</dubbo:reference>
```

