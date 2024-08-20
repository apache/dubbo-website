---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/observability/logging/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/observability/logging/
description: Dubbo 框架的日志配置，
hide_summary: true
linkTitle: 日志管理
no_list: true
title: 日志管理
type: docs
weight: 3
---

## 支持的日志框架
Dubbo 支持以下日志框架，用户可根据业务应用实际使用的日志框架进行配置。

| 第三方日志框架                        | 优先级                                     | 说明                                     |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| Log4j                                 | 最高（默认就用这个）                       | log4j 的直接适配，需要增加 log4j-core、log4j-api 依赖与 log4j.properties |
| SLF4J                                 | 次高（当前推荐）                   | 可支持 log4j、log4j2、logback 等实现。如 logback 可添加slf4j-api、logback-classic、logback-core 依赖与 logback.xml |
| Log4j2                                | 次低                       | log4j2 的直接适配，需要增加 log4j2-core 依赖与 log4j2.xml 配置                   |
| Common Logging(jcl就是common logging)  | 次低（Log4j和SLF4J在项目中均没有就用这个） | 较少项目使用                 |
| JDK log                               | 最低（最后的选择）                         | 较少项目使用           |

{{% alert title="注意" color="warning" %}}
无论使用哪种日志框架，除了 Dubbo 侧配置外，还需要确保应用中加入正确的日志框架依赖和配置文件。
{{% /alert %}}

### 使用 slf4j
对于 spring boot 用户，通过在 `application.yaml` 或 `application.properties` 增加以下配置，开启 slf4j 日志：

```yaml
dubbo:
  application:
    logger: slf4j
```

```properties
dubbo.application.logger=slf4j
```

除此之外，还可以使用使用 JVM 参数进行设置：
```shell
java -Ddubbo.application.logger=slf4j
```

#### 使用 slf4j-log4j2 提供日志输出

增加依赖：

```xml
<!-- SLF4J API -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.30</version>
</dependency>
<!-- Log4j2 to SLF4J Bridge -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.14.1</version>
</dependency>
<!-- Log4j2 Core -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.14.1</version>
</dependency>
<!-- Log4j2 API -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>2.14.1</version>
</dependency>
```

配置一个name是"org.apache.dubbo"的logger就可以了，然后关联到对应的appender。如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
		<File name="Dubbo" fileName="dubbo.log">
		  <PatternLayout>
			<Pattern>%d{yyyy-MM-dd HH:mm:ss} [%t] %-5level %logger{36} - %msg%n</Pattern>
		  </PatternLayout>
		</File>
    </Appenders>
    <Loggers>
        <Logger name="org.apache.dubbo" level="info" additivity="false">
		    <AppenderRef ref="Dubbo"/>
		</Logger>
    </Loggers>
</Configuration>

```

#### 使用 slf4j-logback 提供日志输出

增加依赖：

```xml
<!-- SLF4J API -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-api</artifactId>
    <version>1.7.30</version>
</dependency>

<!-- Logback implementation -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.3</version>
</dependency>

<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-core</artifactId>
    <version>1.2.3</version>
</dependency>
```

增加 logback 配置文件：

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


### 使用 log4j
对于 spring boot 用户，通过在 `application.yaml` 或 `application.properties` 增加以下配置，开启 log4j 日志：
```yaml
dubbo:
  application:
    logger: log4j
```

使用 log4j2：
```yaml
dubbo:
  application:
    logger: log4j2
```

## 访问日志-accesslog

如果想记录每一次请求的详细信息，可开启访问日志，类似于 apache/tomcat server 的访问日志。

在 `application.yaml` 文件中，可以通过以下方式，开启访问日志，日志内容将输出到当前应用正在使用的日志框架（如 log4j、logback 等）。
```yaml
dubbo:
  provider:
    accesslog: true
```

也可以指定访问日志输出到指定文件：

```yaml
dubbo:
  provider:
    accesslog: /home/dubbo/foo/bar.log
```

{{% alert title="注意" color="warning" %}}
无论要动态开启或关闭访问日志，请参考 [流量管控](../../traffic-management/accesslog/) 一节的具体说明。
{{% /alert %}}

## 动态修改日志级别
自 3.3 版本开始，Dubbo 框架支持通过 http 或 telnet 命令，在运行态动态修改日志配置（级别、框架等）。以下是使用示例，关于 telnet 命令的更多内容，可查看 [qos 命令指南](/zh-cn/overview/mannual/java-sdk/reference-manual/qos/qos-list/)。

1. 查询日志配置
	命令：`loggerInfo`

	**示例**
	```bash
	> telnet 127.0.0.1 22222
	> loggerInfo
	```

	**输出**
	```
	Trying 127.0.0.1...
	Connected to localhost.
	Escape character is '^]'.
	   ___   __  __ ___   ___   ____
	  / _ \ / / / // _ ) / _ ) / __ \
	 / // // /_/ // _  |/ _  |/ /_/ /
	/____/ \____//____//____/ \____/
	dubbo>loggerInfo
	Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: INFO
	```

2. 修改日志级别
	命令：`switchLogLevel {level}`

	level: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `OFF`

	**示例**
	```bash
	> telnet 127.0.0.1 22222
	> switchLogLevel WARN
	```

	**输出**
	```
	Trying 127.0.0.1...
	Connected to localhost.
	Escape character is '^]'.
	   ___   __  __ ___   ___   ____
	  / _ \ / / / // _ ) / _ ) / __ \
	 / // // /_/ // _  |/ _  |/ /_/ /
	/____/ \____//____//____/ \____/
	dubbo>loggerInfo
	Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: INFO
	dubbo>switchLogLevel WARN
	OK
	dubbo>loggerInfo
	Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: WARN```
	```

3. 修改日志输出框架
	命令：`switchLogger {loggerAdapterName}`

	loggerAdapterName: `slf4j`, `jcl`, `log4j`, `jdk`, `log4j2`

	**示例**
	```bash
	> telnet 127.0.0.1 22222
	> switchLogger slf4j
	```

	**输出**
	```
	Trying 127.0.0.1...
	Connected to localhost.
	Escape character is '^]'.
	   ___   __  __ ___   ___   ____
	  / _ \ / / / // _ ) / _ ) / __ \
	 / // // /_/ // _  |/ _  |/ /_/ /
	/____/ \____//____//____/ \____/
	dubbo>loggerInfo
	Available logger adapters: [jcl, slf4j, log4j, jdk]. Current Adapter: [log4j]. Log level: INFO
	dubbo>switchLogger slf4j
	OK
	dubbo>loggerInfo
	Available logger adapters: [jcl, slf4j, log4j, jdk]. Current Adapter: [slf4j]. Log level: INFO
	```

## 工作原理

在 Dubbo 框架内所有的日志输出都是通过 LoggerFactory 这个静态工厂类来获得 Logger 的对象实体，并且抽离了一个 LoggerAdapter 用于对接第三方日志框架，所以就有了JDKLoggerAdapter, Log4jLoggerAdapter, SLF4JLoggerAdapter等一些实现子类，分别对接了不同 Log 第三方实现。既然 Dubbo 能够支持这么多log实现，那么这些实现在 Dubbo 中优先级是在呢么样的呢？这里的优先级是指未配置指定的 logger 提供方的情况下，由 Dubbo 框架自己选择。

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
