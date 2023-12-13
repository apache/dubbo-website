---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/observability/logging/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/observability/logging/
description: 日志管理
hide_summary: true
linkTitle: 日志管理
no_list: true
title: 日志管理
type: docs
weight: 3
---

在 Dubbo 框架内所有的日志输出都是通过 LoggerFactory 这个静态工厂类来获得 Logger 的对象实体，并且抽离了一个 LoggerAdapter 用于对接第三方日志框架，所以就有了JDKLoggerAdapter, Log4jLoggerAdapter, SLF4JLoggerAdapter等一些实现子类，分别对接了不同 Log 第三方实现。既然 Dubbo 能够支持这么多log实现，那么这些实现在 Dubbo 中优先级是在呢么样的呢？这里的优先级是指未配置指定的 logger 提供方的情况下，由 Dubbo 框架自己选择。优先级如下：

| 第三方日志框架                        | 优先级                                     |
| ------------------------------------- | ------------------------------------------ |
| Log4j                                 | 最高（默认就用这个）                       |
| SLF4J                                 | 次高（上面没有采用这个）                   |
| Common Logging(jcl就是common logging) | 次低（Log4j和SLF4J在项目中均没有就用这个） |
| JDK log                               | 最低（最后的选择）                         |

Dubbo 日志的调用方式，针对不同的日志打印系统，采用统一的 API 调用及输出，如：

```java
/**
 * ChannelListenerDispatcher
 */
public class ChannelHandlerDispatcher implements ChannelHandler {

    private static final ErrorTypeAwareLogger logger = LoggerFactory.getErrorTypeAwareLogger(ChannelHandlerDispatcher.class);
```

Dubbo 采用的日志输出方式是首先从 dubbo.application.logger 系统变量中获取属性值，来判断到底采用哪种日志输出方式，如果没设置则按照默认的加载顺序加载相应的日志输出类，直到成功加载：

顺序为：log4jLogger > slf4jLogger > JclLogger > JdkLogger

LoggerFactory 在类加载过程中变量的初始化过程：

```java
// search common-used logging frameworks
static {
    String logger = System.getProperty("dubbo.application.logger", "");
    switch (logger) {
        case Slf4jLoggerAdapter.NAME:
            setLoggerAdapter(new Slf4jLoggerAdapter());
            break;
        case JclLoggerAdapter.NAME:
            setLoggerAdapter(new JclLoggerAdapter());
            break;
        case Log4jLoggerAdapter.NAME:
            setLoggerAdapter(new Log4jLoggerAdapter());
            break;
        case JdkLoggerAdapter.NAME:
            setLoggerAdapter(new JdkLoggerAdapter());
            break;
        case Log4j2LoggerAdapter.NAME:
            setLoggerAdapter(new Log4j2LoggerAdapter());
            break;
        default:
            List<Class<? extends LoggerAdapter>> candidates = Arrays.asList(
                Log4jLoggerAdapter.class,
                Slf4jLoggerAdapter.class,
                Log4j2LoggerAdapter.class,
                JclLoggerAdapter.class,
                JdkLoggerAdapter.class
            );
            boolean found = false;
            // try to use the first available adapter
            for (Class<? extends LoggerAdapter> clazz : candidates) {
                try {
                    LoggerAdapter loggerAdapter = clazz.getConstructor().newInstance();
                    loggerAdapter.getLogger(LoggerFactory.class);
                    if (loggerAdapter.isConfigured()) {
                        setLoggerAdapter(loggerAdapter);
                        found = true;
                        break;
                    }
                } catch (Exception | LinkageError ignored) {
                    // ignore
                }
            }
            if (found) {
                break;
            }

            System.err.println("Dubbo: Unable to find a proper configured logger to log out.");
            for (Class<? extends LoggerAdapter> clazz : candidates) {
                try {
                    LoggerAdapter loggerAdapter = clazz.getConstructor().newInstance();
                    loggerAdapter.getLogger(LoggerFactory.class);
                    setLoggerAdapter(loggerAdapter);
                    found = true;
                    break;
                } catch (Throwable ignored) {
                    // ignore
                }
            }
            if (found) {
                System.err.println("Dubbo: Using default logger: " + loggerAdapter.getClass().getName() + ". " +
                    "If you cannot see any log, please configure -Ddubbo.application.logger property to your preferred logging framework.");
            } else {
                System.err.println("Dubbo: Unable to find any available logger adapter to log out. Dubbo logs will be ignored. " +
                    "Please configure -Ddubbo.application.logger property and add corresponding logging library to classpath.");
            }
    }
}
```

上面这段静态块是在LoggerFactory里面，说明只要LoggerFactory类一加载就会去选择对应的日志提供方。大家可能会发现对日志的提供方其实是可以通过配置来指定的，因为静态块一开始是从当前jvm环境中获取dubbo.application.logger，这个参数是同java -Ddubbo.application.logger=xxxx去指定的，如果是放在容器里面，就需要配置在容器启动的jvm参数里面。

## 使用Log4j来提供日志输出

你不用做过多的处理就可以开启dubbo的日志，因为dubbo默认就是使用log4j。你唯一需要做的就是配置一个name是"com.alibaba.dubbo"的logger就可以了，然后关联到对应的appender。如下：

```xml
<appender name="dubboAppender" class="org.apache.log4j.DailyRollingFileAppender"> 
        <param name="File" value="E:/dubbo.log" />  
        <param name="DatePattern" value="'.'yyyy-MM-dd'.log'" />  
        <layout class="org.apache.log4j.PatternLayout"> 
         <param name="ConversionPattern"
            value="[%d{MMdd HH:mm:ss SSS\} %-5p] [%t] %c{3\} - %m%n" /> 
        </layout>  
</appender> 
<logger name="com.alibaba.dubbo" additivity="false"> 
        <priority value ="info"/>  
        <appender-ref ref="dubboAppender" />  
</logger>
```

## 使用logback来提供日志输出

这种情况，默认是看不到dubbo的日志输出的，除非出现异常，被你当前系统的日志框架拦截住了。我这里就拿当前使用最多的日志框架logback来做示例。我们知道logback天生和slf4j进行了集成，所以要在项目里面使用logback，调用slf4j暴露的接口就可以。所以要把dubbo的日志输出切换到logback，也就变成了切换到slf4j了。

```xml
<timestamp key="byDate" datePattern="yyyyMMdd"/>
    <!-- dubbo log -->
    <appender name="dubboRolling" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <Encoding>UTF-8</Encoding>
        <file>${LOG_HOME_DUBBO}/MTP-DUBBO.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_HOME_DUBBO}/DEMO-%d{yyyy-MM-dd}.%i-DUBBO.zip</fileNamePattern>
            <maxHistory>30</maxHistory>
            <TimeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <MaxFileSize>100MB</MaxFileSize>
            </TimeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            <immediateFlush>true</immediateFlush>
        </encoder>
    </appender>
    <logger name="com.alibaba.dubbo" level="DEBUG">
        <appender-ref ref="dubboRolling"/>
    </logger>
```

Dubbo 也可以将日志信息记录或者保存到文件中。

1. 使用`accesslog`输出到`log4j` 

```xml
<dubbo:protocol accesslog="true" name="dubbo" port="20880"/>
<dubbo:protocol accesslog="true" name="rmi" port="1099" />
```

2. 输出到文件

```xml
<dubbo:protocol accesslog="http://localhost/log.txt" name="dubbo" port="20880"/>
<dubbo:protocol accesslog="http://localhost/log2.txt" name="rmi" port="1099" />
```