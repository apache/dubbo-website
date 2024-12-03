---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/support-graalvm/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/support-graalvm/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/support-graalvm/
description: "Detailed explanation of Dubbo AOT technology and how to implement static Dubbo applications using GraalVM Native Image."
linkTitle: Support for GraalVM Native Image
title: "Dubbo AOT -- How to Implement Static Dubbo Applications using GraalVM Native Image"
type: docs
weight: 40
---

In the Dubbo 3.3.0 version, we officially released the Dubbo AOT static solution. This document will introduce how to connect applications to GraalVM Native Image through Dubbo AOT technology, the process of compiling applications into native binary packages, and the components currently supported.

{{% alert title="Dubbo GraalVM adaptation document may be out of date" color="warning" %}}
Due to the rapid development of Dubbo AOT technology, this document may not always be up to date. Please refer to the following content for the latest information and usage:
* <a href="https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-native-image-registry" target="_blank">Sample project source code</a>

For more information about GraalVm, you can read the document at https://www.graalvm.org/docs/getting-started/container-images/.
{{% /alert %}}

## Usage Scenarios
- Native Image Compilation: Pre-compile applications into native images to reduce startup time and memory usage.

- Language Interoperability: GraalVM allows writing code in multiple languages to interoperate within the same application.

- Optimization: GraalVM provides optimizations for applications written in Java, JavaScript, and other languages, enhancing the performance of Dubbo applications.

- Polyglot Debugging: GraalVM can debug code written in multiple languages within the same session, which is very useful for troubleshooting issues in complex Dubbo applications.

- Java Runtime: It can run on GraalVM, providing a faster, more efficient Java runtime environment.

- Developing Microservices: It can be combined with GraalVM to create high-performance, low-resource-utilization microservices.

## How to Use
Before compiling our Dubbo project, ensure that we are based on a GraalVM environment.

### Step 1: Install GraalVM
1. Select the corresponding GraalVM version for your system from the official GraalVM website: https://www.graalvm.org/downloads/
2. Install native-image according to the official documentation: https://www.graalvm.org/latest/reference-manual/native-image/#install-native-image

### Step 2: Configure Profiles

This includes maven-compiler-plugin, spring-boot-maven-plugin, native-maven-plugin, and dubbo-maven-plugin. Modify the mainClass in dubbo-maven-plugin to the full path of the required startup class. (The API usage does not require adding the spring-boot-maven-plugin dependency.)

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

### Step 3: Add Native Related Dependencies in Pom:

**The API usage does not require adding the dubbo-config-spring6 dependency.**

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

### Step 4: Configure the Application

Example configuration:

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

### Step 5: Compile

Run the following compile command in the project's root path:

- Execute directly for API usage

```
 mvn clean install -P native -Dmaven.test.skip=true
```

- For annotation and XML methods (Springboot3 integration)

```shell
 mvn clean install -P native native:compile -Dmaven.test.skip=true
```

### Step 6: Execute the Binary File

The binary file is located in the target/ directory, usually named after the project, for example, target/native-demo.

## Supported Components and Corresponding Versions

### Logging Components

| Component Name               | Required Plugin               | Plugin Version               | Notes                |
| ----------------------------- | ------------------------------ | ----------------------------- | ------------------- |
| Apache Commons Logging        | native-maven-plugin           | 0.9.24 and above             |                     |
| JDK Logger                    | native-maven-plugin           | 0.9.24 and above             |                     |
| slf4j                         | spring-boot-maven-plugin      | 3.x.x (latest version)      |                     |
| Log4j                         | native-maven-plugin           | 0.10.0 and above             |                     |
| Log4j2                        |                                |                             |                     |

### Serialization Components

| Component Name     | Required Plugin          | Plugin Version        | Notes                         |
| ------------------ | ----------------------- |------------------| ---------------------------- |
| FastJson2          | dubbo-maven-plugin      | 3.3.0 and above  |                              |
| JDK                | native-maven-plugin     | 0.9.24 and above |                              |
| Hessian-Lite       |                         |                  | Not friendly with JDK 17, unsupported for now |

### Registry Center Components

| Component Name  | Required Plugin         | Plugin Version                        | Notes                     |
| ---------------- | ----------------------- | ----------------------------------- | ------------------------ |
| Zookeeper       | dubbo-maven-plugin      | 3.3.0 | Only supports Zookeeper Curator5 |

### Metadata Center Components

| Component Name  | Required Plugin         | Plugin Version                        | Notes                     |
| ---------------- | ----------------------- | ----------------------------------- | ------------------------ |
| Zookeeper       | dubbo-maven-plugin      | 3.3.0 | Only supports Zookeeper Curator5 |

### Configuration Center Components

| Component Name  | Required Plugin         | Plugin Version  | Notes                     |
| ---------------- | ----------------------- |----------------| ------------------------ |
| Zookeeper       | dubbo-maven-plugin      | 3.3.0 | Only supports Zookeeper Curator5 |

### Observability Components

| Component Name   | Required Plugin | Plugin Version | Notes |
| ---------------- | ---------------- | ---------------- | ---- |
| Micrometer       |                  |                  |      |

