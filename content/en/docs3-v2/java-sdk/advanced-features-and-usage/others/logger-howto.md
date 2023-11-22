---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/others/logger-howto/
description: How to configure and use the logging framework in dubbo and dubbo-samples
linkTitle: Logging Framework Configuration and Usage
title: Logging Framework Configuration and Usage
type: docs
weight: 7
---

## Feature Description

Prior to dubbo 3.3.0-beta.3, dubbo and dubbo-samples were using a mix of log4j and logback, leading to frequent conflicts and errors due to some modules lacking log configuration. Therefore, after 3.3.0-beta.3, the logging components have been upgraded to log4j2 for simplicity and reduced maintenance costs. This document explains how to configure and use the logging framework to avoid conflicts caused by indirectly introducing multiple logging frameworks.

## How To Use

### Usage Conventions

* Please use log4j2 as the logging framework, and avoid using log4j and logback. Except for some legacy scenarios, using a single logging framework can reduce usage cost and prevent conflicts.
* Avoid passing logging framework dependencies upstream, which can be resolved by setting scope to `test` or `provider` in maven, or by setting `<optional>true</optional>`. As a service framework, dubbo should ideally avoid passing non-essential dependencies and leave the choice of logging framework to the user.

### Usage Scenarios

#### 1. General dubbo Module

Most modules are of this type, generally requiring logging frameworks for unit testing.


1. Include Maven dependency, note if parent has already included it, then there's no need to add it again:

    ```xml
        <dependency>
          <groupId>org.apache.logging.log4j</groupId>
          <artifactId>log4j-slf4j-impl</artifactId>
          <scope>test</scope>
        </dependency>
    ```

2. Add log4j2 logging configuration `src/test/resources/log4j2-test.xml`, the reason for using this name is to ensure the highest priority.

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <Configuration status="WARN">
       <Appenders>
           <Console name="Console" target="SYSTEM_OUT" follow="true">
               <PatternLayout pattern="%d{HH:mm:ss.SSS} |-%highlight{%-5p} [%t] %40.40c:%-3L -| %m%n%rEx{filters(jdk.internal.reflect,java.lang.reflect,sun.reflect,org.junit,org.mockito)}" charset="UTF-8"/>
           </Console>
       </Appenders>
       <Loggers>
           <Root level="info">
               <AppenderRef ref="Console"/>
           </Root>
       </Loggers>
   </Configuration>
   ```


#### 2. Non spring-boot Demo Module
1. Include Maven dependency, note if parent has already included it, then there's no need to add it again

    ```xml
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-slf4j-impl</artifactI>
        </dependency>
    ```
    
2. Add log4j2 logging configuration `src/test/resources/log4j2-test.xml`

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <Configuration status="WARN">
       <Appenders>
           <Console name="Console" target="SYSTEM_OUT" follow="true">
               <PatternLayout pattern="%style{%d{HH:mm:ss.SSS}}{Magenta} %style{|-}{White}%highlight{%-5p} [%t] %style{%40.40c}{Cyan}:%style{%-3L}{Blue} %style{-|}{White} %m%n%rEx{filters(jdk.internal.reflect,java.lang.reflect,sun.reflect)}" disableAnsi="false" charset="UTF-8"/>
           </Console>
       </Appenders>
       <Loggers>
           <Root level="info">
               <AppenderRef ref="Console"/>
           </Root>
       </Loggers>
   </Configuration>
   ```
   
#### 3. Spring-boot Demo Module

Spring-boot supports introducing log4j2 dependencies via a starter, but note that spring-boot defaults to using logback, so it needs to be excluded in `<dependencyManagement>`

1. Exclude spring-boot-starter-logging

    ```xml
      <dependencyManagement>
        <dependencies>
          <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
          </dependency>
          <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <version>${spring-boot.version}</version>
            <exclusions>
              <exclusion>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-logging</artifactId>
              </exclusion>
            </exclusions>
          </dependency>
        </dependencies>
      </dependencyManagement>
    ```

2. Include Maven dependency:

   ```xml
       <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-log4j2</artifactId>
       </dependency>
   ```

3. Add log4j2 logging configuration `src/main/resources/log4j2.xml`

   Optional, as spring-boot comes with a default logging configuration.

#### 4. Spring-boot native Demo Module

Since log4j2 does not yet support native, use logback as the logging framework. No changes are necessary, retain the existing approach and ensure not to indirectly introduce log4j or slf4j-log4j12.

## Common Logging Framework Issues

#### 1. Missing Logging Framework

Console output:

```
SLF4J: No SLF4J providers were found.
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See SLF4J Error Codes for further details.
```

Solution: Add log4j2 dependency

```xml
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-slf4j-impl</artifactI>
    </dependency>
```

#### 2. Logging Framework Conflict

Console output:

```
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:.../slf4j-log4j12-1.x.x.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:.../logback-classic-1.x.x.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:.../log4j-slf4j-impl-2.x.x.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.slf4j.impl.Log4jLoggerFactory]
```

Or

```
Exception in thread "main" java.lang.IllegalArgumentException: LoggerFactory is not a Logback LoggerContext but Logback is on the classpath
```
Solution: Exclude all dependencies except for log4j-slf4j-impl. It's highly recommended to use [Maven Helper - IntelliJ IDEs Plugin](https://plugins.jetbrains.com/plugin/7179-maven-helper) for dependency analysis and exclusion.

#### 3. Other Issues

Refer to: [SLF4J Error Codes](https://www.slf4j.org/codes.html)
