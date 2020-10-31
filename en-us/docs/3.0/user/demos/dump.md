# Dump
When the business thread pool is full, we need to know what resources/conditions are waiting for the thread , to find the bottleneck point of the system or abnormal point. `dubbo` automatically export thread stack through `Jstack` to keep the scene for easy to troubleshoot the problem.

Default policy:

* Export file path，user.home directory
* Export interval，The shortest interval allows you to export every 10 minutes

Specified export file path:
```properties
# dubbo.properties
dubbo.application.dump.directory=/tmp
```

```xml
<dubbo:application ...>
    <dubbo:parameter key="dump.directory" value="/tmp" />
</dubbo:application>
```
