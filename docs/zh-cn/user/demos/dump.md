当业务线程池满时，我们需要知道线程都在等待哪些资源、条件，以找到系统的瓶颈点或异常点。dubbo通过Jstack自动导出线程堆栈来保留现场，方便排查问题

默认策略:

* 导出路径，user.home标识的用户主目录
* 导出间隔，最短间隔允许每隔10分钟导出一次

指定导出路径：
```properties
# dubbo.properties
dubbo.application.dump.directory=/tmp
```

```xml
<dubbo:application ...>
    <dubbo:parameter key="dump.directory" value="/tmp" />
</dubbo:application>
```