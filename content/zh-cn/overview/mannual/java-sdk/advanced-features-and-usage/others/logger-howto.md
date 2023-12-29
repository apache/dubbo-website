---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/others/logge-howto/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/others/logger-howto/
description: 在dubbo和dubbo-samples中如何配置与使用日志框架
linkTitle: 日志框架配置与使用
title: 日志框架配置与使用
type: docs
weight: 7
---

## 特性说明

在dubbo 3.3.0-beta.3之前，dubbo和dubbo-samples中存在混用log4j和logback的情况，并且部分模块缺少日志配置，造成日志框架使用混乱，经常冲突报错。因此在3.3.0-beta.3之后，统一将日志组件升级替换为log4j2，配置使用上更加简洁，减少了维护成本。此文档说明了应该如何配置使用日志框架，避免间接引入多种日志框架，引起冲突报错。

## 使用方法

### 使用约定

* 请使用log4j2做为日志框架，禁止使用log4j和logback.
  除部分遗留场景，统一使用一种日志框架可以降低使用成本，避免冲突
* 避免日志框架依赖被传递到上游，可以通过在maven设置scope为`test、provider`或设置`<optional>true</optional>`的方式解决.
  dubbo作为一个服务框架应该尽量避免传递非必选依赖，将日志框架选择权交给用户

### 使用场景

#### 1. 普通dubbo模块

绝大多数模块是此类型，一般是单元测试需要用到日志框架

1. 引入maven依赖，注意如果parent已经引入则无需重复添加

    ```xml
        <dependency>
          <groupId>org.apache.logging.log4j</groupId>
          <artifactId>log4j-slf4j-impl</artifactId>
          <scope>test</scope>
        </dependency>
    ```

2. 添加log4j2日志配置 `src/test/resources/log4j2-test.xml`，使用此名称原因是可以保证最高优先级

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


#### 2. 非spring-boot demo模块
1. 引入maven依赖，注意如果parent已经引入则无需重复添加

    ```xml
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-slf4j-impl</artifactI>
        </dependency>
    ```
    
2. 添加log4j2日志配置 `src/main/resources/log4j2.xml`

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
   
#### 3. spring-boot demo模块

spring-boot支持用starter的方式引入log4j2依赖，但是注意spring-boot默认使用logback，因此需要在`<dependencyManagement>`中排除

1. 排除spring-boot-starter-logging

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

2. 引入maven依赖

   ```xml
       <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-log4j2</artifactId>
       </dependency>
   ```

3. 添加log4j2日志配置 `src/main/resources/log4j2.xml`

   可选，spring-boot自带默认日志配置

#### 4. spring-boot native demo模块

因为log4j2尚不支持native，需要使用logback来作为日志框架，因此无需任何修改，保留原有方式即可，注意不要间接引入log4j或slf4j-log4j12

## 常见日志框架问题

#### 1. 缺少日志框架

控制台输出:

```
SLF4J: No SLF4J providers were found.
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See SLF4J Error Codes for further details.
```

解决方案: 引入log4j2依赖

```xml
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-slf4j-impl</artifactI>
    </dependency>
```

#### 2. 日志框架冲突

控制台输出:

```
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:.../slf4j-log4j12-1.x.x.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:.../logback-classic-1.x.x.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:.../log4j-slf4j-impl-2.x.x.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.slf4j.impl.Log4jLoggerFactory]
```

或

```
Exception in thread "main" java.lang.IllegalArgumentException: LoggerFactory is not a Logback LoggerContext but Logback is on the classpath
```

解决方案: 排除掉除了log4j-slf4j-impl的依赖, 强烈推荐使用 [Maven Helper - IntelliJ IDEs Plugin](https://plugins.jetbrains.com/plugin/7179-maven-helper) 来分析和排除依赖

#### 3. 其他问题

可以参考: [SLF4J Error Codes](https://www.slf4j.org/codes.html)
