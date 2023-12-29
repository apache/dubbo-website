---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/support-graalvm/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/support-graalvm/
description: Dubbo 支持 GraalVM Native Image
linkTitle: 支持 GraalVM Native Image
title: 支持 Graal VM
type: docs
weight: 40
---




## 功能说明
Dubbo3.2 支持 Native-Image 文档, 本文档将介绍将 dubbo3.x 项目接入 GraalVM Native Image，进行 native-image 编译为二进制的流程以及目前支持的组件。

关于 GraalVm 的更多信息可以阅读 https://www.graalvm.org/docs/getting-started/container-images/ 此文档。

## 使用场景
- 本机映像编译：将应用程序预编译为本机映像，缩短启动时间并减少内存使用。

- 语言互操作：GraalVM 能够用多种语言编写代码，在同一应用程序中进行互操作。

- 优化：GraalVM 为用 Java、JavaScript 和其他语言编写的应用程序提供优化，提高 Dubbo 应用程序的性能。

- Polyglot 调试：GraalVM 能够在同一会话中调试用多种语言编写的代码，对复杂 Dubbo 应用程序中的问题进行故障排除时非常有用。

- Java 运行时：可以在 GraalVM 上运行，提供更快、更高效的 Java 运行时环境。

- 开发微服务：可以与 GraalVM 结合，创建高性能、低资源利用率的微服务。

## 使用方式
在编译我们的dubbo项目之前，需要确保我们正基于graalVm的环境。

### 第一步：安装GraalVM
1. 在Graalvm官网根据自己的系统选取对应Graalvm版本：https://www.graalvm.org/downloads/
2. 根据官方文档安装native-image：https://www.graalvm.org/latest/reference-manual/native-image/#install-native-image

### 第二步：配置profiles

其中包括maven-compiler-plugin、spring-boot-maven-plugin、native-maven-plugin、dubbo-maven-plugin，修改dubbo-maven-plugin中的mainClass为所需的启动类全路径。（其中API使用方式无需添加spring-boot-maven-plugin依赖。）

```xml
    <profiles>
        <profile>
            <id>native</id>
            <build>
                <plugins>
                    <plugin>
                        <artifactId>maven-compiler-plugin</artifactId>
                        <configuration>
                            <release>17</release>
                            <fork>true</fork>
                            <verbose>true</verbose>
                        </configuration>
                    </plugin>
                    <plugin>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-maven-plugin</artifactId>
                        <executions>
                            <execution>
                                <id>process-aot</id>
                                <goals>
                                    <goal>process-aot</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <plugin>
                        <groupId>org.graalvm.buildtools</groupId>
                        <artifactId>native-maven-plugin</artifactId>
                        <version>0.9.25</version>
                        <configuration>
                            <classesDirectory>${project.build.outputDirectory}</classesDirectory>
                            <metadataRepository>
                                <enabled>true</enabled>
                            </metadataRepository>
                            <requiredVersion>22.3</requiredVersion>
                        </configuration>
                        <executions>
                            <execution>
                                <id>add-reachability-metadata</id>
                                <goals>
                                    <goal>add-reachability-metadata</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                    <plugin>
                        <groupId>org.apache.dubbo</groupId>
                        <artifactId>dubbo-maven-plugin</artifactId>
                        <version>${dubbo.version}</version>
                        <configuration>
                            <mainClass>com.example.nativedemo.NativeDemoApplication</mainClass>
                        </configuration>
                        <executions>
                            <execution>
                                <phase>process-sources</phase>
                                <goals>
                                    <goal>dubbo-process-aot</goal>
                                </goals>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>
```



### 第三步：在Pom依赖中添加native相关的依赖：

**其中API使用方式无需添加dubbo-config-spring6依赖**。

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-config-spring6</artifactId>
    <version>${dubbo.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-native</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

### 第四步：配置应用

示例配置如下：

```yaml
dubbo:
  application:
    name: ${spring.application.name}
    logger: slf4j
  protocol:
    name: dubbo
    port: -1
    serialization: fastjson2
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
  config-center:
    address: zookeeper://127.0.0.1:2181
  metadata-report:
    address: zookeeper://127.0.0.1:2181
  provider:
    serialization: fastjson2
  consumer:
    serialization: fastjson2
```

### 第五步：编译

在项目根路径下执行以下编译命令：

- API方式直接执行

```
 mvn clean install -P native -Dmaven.test.skip=true
```

- 注解和xml方式（Springboot3集成的方式）

```shell
 mvn clean install -P native native:compile -Dmaven.test.skip=true
```

### 第六步：执行二进制文件即可

二进制文件在target/目录下，一般以工程名称为二进制包的名称，比如target/native-demo

## 支持的组件以及对应的版本

### 日志组件

| 组件名称               | 所需的插件               | 插件版本               | 备注                |
| ---------------------- | ------------------------ | ---------------------- | ------------------- |
| Apache Commons Logging | native-maven-plugin      | 0.9.24 及其以上        |                     |
| JDK Logger             | native-maven-plugin      | 0.9.24 及其以上        |                     |
| slf4j                  | spring-boot-maven-plugin | 3.x.x (用最新版本即可) |                     |
| Log4j                  |                          |                        | 计划推动GraalVM支持 |
| Log4j2                 |                          |                        |                     |

### 序列化组件

| 组件名称     | 所需的插件          | 插件版本                                | 备注                         |
| ------------ | ------------------- | --------------------------------------- | ---------------------------- |
| FastJson2    | dubbo-maven-plugin  | 3.3.0-beta.1-SNAPSHOT (Preview)及其以上 |                              |
| JDK          | native-maven-plugin | 0.9.24 及其以上                         |                              |
| Hessian-Lite |                     |                                         | 对JDK 17支持不友好，暂不支持 |

### 注册中心组件

| 组件名称  | 所需的插件         | 插件版本                        | 备注                     |
| --------- | ------------------ | ------------------------------- | ------------------------ |
| Zookeeper | dubbo-maven-plugin | 3.3.0-beta.1-SNAPSHOT (Preview) | 仅支持Zookeeper Curator5 |

### 元数据中心组件

| 组件名称  | 所需的插件         | 插件版本                        | 备注                     |
| --------- | ------------------ | ------------------------------- | ------------------------ |
| Zookeeper | dubbo-maven-plugin | 3.3.0-beta.1-SNAPSHOT (Preview) | 仅支持Zookeeper Curator5 |

### 配置中心组件

| 组件名称  | 所需的插件         | 插件版本                        | 备注                     |
| --------- | ------------------ | ------------------------------- | ------------------------ |
| Zookeeper | dubbo-maven-plugin | 3.3.0-beta.1-SNAPSHOT (Preview) | 仅支持Zookeeper Curator5 |

### 可观测性组件

| 组件名称   | 所需的插件 | 插件版本 | 备注 |
| ---------- | ---------- | -------- | ---- |
| Micrometer |            |          |      |

