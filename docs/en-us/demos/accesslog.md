# Access Log
If you want to logging the access information for each provide service,you can turn on the `accesslog` switch,which like the access log of `Apache`.

**Note:**
The size of the access log maybe too much,please check the disk capacity.
Now I will show you how to config the access log.
## Logging by logging framework
```xml
<dubbo:protocol accesslog="true" .../>
```
The above configuration will turn on `accesslog` switch for all provide services,and logging the access log with logging framework(log4j/logback/slf4j...).You can config the logging framework of `logger` and `appender` for logging the access log.The simplest way is config logger name with `dubbo.accesslog`. The Example:

```xml
<appender name="accesslogAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${loggingRoot}/accesslog/logging.log</file>
        <encoding>${loggingCharset}</encoding>
        <append>true</append>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <FileNamePattern>${loggingRoot}/accesslog/%d{yyyyMMdd}/logging.log.%d{yyyyMMdd}%i.gz
            </FileNamePattern>
            <MaxHistory>15</MaxHistory>
            <TimeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <MaxFileSize>1024MB</MaxFileSize>
            </TimeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern><![CDATA[%level|%d{yyyy-MM-dd HH:mm:ss}|%m%n}]]></pattern>
        </layout>
</appender>
<logger name="dubbo.accesslog" level="INFO" additivity="false">
        <appender-ref ref="accesslogAppender"/>
</logger>
```
The above is the demonstration of logback framework.Other logging framework is same too.It will logging the access log of all provide services into single file(`accesslog/logging.log`). And you can also config the access log of each provide service to logging separately,Only change `name` attribute of the `logger` tag,set the `name` attribute to `dubbo.accesslog.serviceInterfaceClassFullName`.The Example:

```xml
<logger name="dubbo.accesslog.com.dubbo.FooServiceInterface" level="INFO" additivity="false">
        <appender-ref ref="fooServiceAccesslogAppender"/>
</logger>
```

If you only want logging the access log of specified provide service,but not all services.It's supported too.The Example:
```xml
<dubbo:service accesslog="true" .../>
```

## Logging by specified file path

You can specify the file path with the `accesslog` attribute.The Example:

```xml
<dubbo:protocol accesslog="/home/admin/logs/service/accesslog.log" .../>
```
OR
```xml
<dubbo:service accesslog="/home/admin/logs/service/accesslog.log" .../>
```
