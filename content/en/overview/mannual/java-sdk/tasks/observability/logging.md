---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/observability/logging/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/observability/logging/
description: Log configuration for the Dubbo framework.
hide_summary: true
linkTitle: Log Management
no_list: true
title: Log Management
type: docs
weight: 3
---

## Supported Log Frameworks
Dubbo supports the following logging frameworks, and users can configure based on the logging framework actually used in their business applications.

| Third-party Log Framework             | Priority                                     | Description                                     |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| Log4j                                 | Highest (used by default)                | Direct adaptation of Log4j, requires adding log4j-core, log4j-api dependencies and log4j.properties |
| SLF4J                                 | Second highest (currently recommended)   | Supports log4j, log4j2, logback, etc. For logback, add slf4j-api, logback-classic, logback-core dependencies and logback.xml |
| Log4j2                                | Second lowest                          | Direct adaptation of Log4j2, requires adding log4j2-core dependency and log4j2.xml configuration |
| Common Logging (jcl is common logging) | Second lowest (used if neither Log4j nor SLF4J is in the project) | Rarely used in projects                 |
| JDK log                               | Lowest (last resort)                      | Rarely used in projects           |

{{% alert title="Note" color="warning" %}}
Regardless of the logging framework used, in addition to configuring on the Dubbo side, ensure the application includes the correct logging framework dependencies and configuration files.
{{% /alert %}}

### Using slf4j
For Spring Boot users, enable slf4j logging by adding the following configuration to `application.yaml` or `application.properties`:

```yaml
dubbo:
  application:
    logger: slf4j
```

```properties
dubbo.application.logger=slf4j
```

Additionally, you can also set it using JVM arguments:
```shell
java -Ddubbo.application.logger=slf4j
```

#### Using slf4j-log4j2 for Log Output

Add dependencies:

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

Configure a logger with the name "org.apache.dubbo" and associate it with the corresponding appender, as follows:

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

#### Using slf4j-logback for Log Output

Add dependencies:

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

Add a logback configuration file:

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

### Using log4j
For Spring Boot users, enable log4j logging by adding the following configuration to `application.yaml` or `application.properties`:
```yaml
dubbo:
  application:
    logger: log4j
```

Using log4j2:
```yaml
dubbo:
  application:
    logger: log4j2
```

## Access Logs - accesslog

If you want to log detailed information for each request, you can enable access logs like the access logs of apache/tomcat server.

In the `application.yaml` file, you can enable access logging as follows, and the log content will be output to the currently used log framework (such as log4j, logback, etc.).
```yaml
dubbo:
  provider:
    accesslog: true
```

You can also specify the access log to be output to a specified file:

```yaml
dubbo:
  provider:
    accesslog: /home/dubbo/foo/bar.log
```

{{% alert title="Note" color="warning" %}}
Refer to the [Traffic Control](../../traffic-management/accesslog/) section for specific instructions on dynamically enabling or disabling access logs.
{{% /alert %}}

## Dynamically Modify Log Level
Starting from version 3.3, the Dubbo framework supports dynamically modifying log configuration (level, framework, etc.) at runtime through http or telnet commands. Below is an example of usage; for more on telnet commands, refer to the [qos Command Guide](/en/overview/mannual/java-sdk/reference-manual/qos/qos-list/).

1. Query Log Configuration
    Command: `loggerInfo`

    **Example**
    ```bash
    > telnet 127.0.0.1 22222
    > loggerInfo
    ```

    **Output**
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

2. Modify Log Level
    Command: `switchLogLevel {level}`

    level: `ALL`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `OFF`

    **Example**
    ```bash
    > telnet 127.0.0.1 22222
    > switchLogLevel WARN
    ```

    **Output**
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
    Available logger adapters: [jcl, jdk, log4j, slf4j]. Current Adapter: [log4j]. Log level: WARN
    ```

3. Change Log Output Framework
    Command: `switchLogger {loggerAdapterName}`

    loggerAdapterName: `slf4j`, `jcl`, `log4j`, `jdk`, `log4j2`

    **Example**
    ```bash
    > telnet 127.0.0.1 22222
    > switchLogger slf4j
    ```

    **Output**
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

## Working Principle

In the Dubbo framework, all log outputs are obtained through the static factory class LoggerFactory to gain Logger object instances. Additionally, a LoggerAdapter is abstracted to interface with third-party logging frameworks, leading to implementations like JDKLoggerAdapter, Log4jLoggerAdapter, SLF4JLoggerAdapter, etc., which interface with different third-party log implementations. Since Dubbo can support so many logging implementations, what is the priority of these implementations in Dubbo? This priority refers to the situation when no specific logger provider is configured, and the Dubbo framework chooses on its own.

The way Dubbo logs is to adopt a uniform API call and output for different log printing systems, such as:

```java
/**
 * ChannelListenerDispatcher
 */
public class ChannelHandlerDispatcher implements ChannelHandler {

    private static final ErrorTypeAwareLogger logger = LoggerFactory.getErrorTypeAwareLogger(ChannelHandlerDispatcher.class);
```

The logging output method adopted by Dubbo first obtains the property value from the dubbo.application.logger system variable to determine which logging output method to use; if not set, it loads the corresponding logging output class in the default loading order until successfully loaded:

Order: log4jLogger > slf4jLogger > JclLogger > JdkLogger

The initialization process of the variables in LoggerFactory during class loading:

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

The above static block resides in LoggerFactory, indicating that as soon as the LoggerFactory class is loaded, it will select the corresponding log provider. You will notice that the log provider can actually be designated by configuration, as the static block initially fetches dubbo.application.logger from the current JVM environment. This parameter can be specified using `java -Ddubbo.application.logger=xxxx`, and if deployed in a container, it needs to be configured in the JVM parameters during container startup.
