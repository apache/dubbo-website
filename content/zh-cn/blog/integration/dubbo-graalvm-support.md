---
title: "走向 Native 化：Spring&Dubbo AOT 技术示例与原理讲解"
linkTitle: "走向 Native 化：Dubbo AOT 正式发布"
date: 2023-06-28
tags: ["Java", "Native Image", "GraalVM"]
authors: ["刘军", "华钟明"]
description: >
  本文讲解了 GraavlVM 的基本工作原理，Native Image 的构建方式，如何使用 Dubbo AOT 构建打包静态化的 Dubbo 应用，解决应用“冷启动”慢、内存占用高、预热时间长等问题。
---

Java 应用在云计算时代面临“冷启动”慢、内存占用高、预热时间长等问题，无法很好的适应 Serverless 等云上部署模式，GraalVM 通过静态编译、打包等技术在很大程度上解决了这些问题，同时针对 GraalVM 的一些使用限制，Spring 和 Dubbo 等主流框架也都提供了相应的 AOT 解决方案。

本文我们将详细分析 Java 应用在云时代面临的挑战，GraalVM Native Image 是如何解决这些问题，GraalVM 的基本概念与工作原理，最后我们通过一个 Spring6 + Dubbo3 的微服务应用示例演示了如何将一个普通微服务应用进行静态化打包。

本文主要分为以下四个部分展开

1. 首先我们会先看一下在云计算快速发展的当下，云上应用应该具备的特点，Java 应用在云上所面临的挑战有哪些。
2. 其次，我会介绍一下 GraalVM，什么是 Native Image，如何通过 GraalVM 对 Java 应用进行静态化打出 Native Image 可执行的二进制程序。
3. 第三部分，我们知道 GraalVM 的使用是有一定限制的，比如 Java 的反射等动态特性是不被支持的，因此我们需要提供特殊的 Metadata 配置来绕过这些限制，在这一部分我们会讲解如何加入引入 AOT Processing 来实现自动化的 Metadata 配置，包括 Spring6 框架中 AOT 处理、Dubbo3 框架的 AOT 处理等。
4. 最后，我们将通过一个 Spring6+Dubbo3 的应用示例，来演示如何将这么一个 Java 应用进行静态化打包。

## Java 应用在云时代所面临的挑战

首先，我们先看一下云计算时代的应用特点，以及 Java 在云时代所面临的挑战。从各个统计机构给出的数据来看，Java 语言仍然是当今最受开发者欢迎的编程语言之一，仅次于一些脚本开发语言。使用 Java 语言可以非常高效的开发业务应用，丰富的生态使得 Java 具有非常高的开发和运行效率，有无数的应用基于 Java 语言开发。

![image.png](/imgs/blog/2023/6/graalvm/language-rank.png)

但在来到云计算时代，Java 应用的部署和运行开始面临非常多的问题。我们以Serverless为例，Serverless是云上的一种越来越主流的部署模式，它让开发者更专注业务逻辑、通过快速弹性等帮助解决资源问题，根据最新的一些数据，Java在所有云计算厂商的 Serverless 运行时中所占比例并不高，远远不能和它在传统应用开发中所占的比例相匹配。

![image.png](/imgs/blog/2023/6/graalvm/serverless-lang-rank.png)

出现这样的原因，主要是Java应用不能很好的满足Serverless场景的几个关键要求。

- **首先是启动速度问题，Java 冷启动的耗时是比较长的**。这对于Serverless需要快速弹起的场景是一个非常大的挑战，因为 Java 应用的拉起时间可能是秒、数十秒级别的；
- **第二点，Java应用往往都需要一定的预热时间，才能达到最佳的性能状态**，刚刚拉起的应用如果分配比较大的流量是不合适的，往往会出现请求超时、资源占用过高等问题，这就进一步拉长了 Java 应用的有效拉起时间；
- **第三点是 Java 应用对运行环境的要求，它往往需要较大的内存、计算资源**，而这些真正分配给业务自身的并不多，都消耗在一些JVM运行时上，这与用云降本提效的目标并不匹配；
- **最后，Java应用打出来的包或者镜像也是非常大**，从总体上也影响存储、拉取的效率。

接下来，我们具体看一下针对 Java 应用所面临的这些问题， GraalVM 这样一种打包和运行时技术是如何解决的。

## GraalVM 简介

> GraalVM compiles your Java applications ahead of time into standalone binaries that start instantly, provide peak performance with no warmup, and use fewer resources.

引用官方介绍来看，GraalVM 为 Java 应用提供 AOT 编译和二进制打包能力，基于 GraalVM 打出的二进制包可以实现快速启动、具有超高性能、无需预热时间、同时需要非常少的资源消耗。这里所说的 AOT 是发生在编译期间的一个技术简称，即 Ahead-of-time，这一点我们后续会讲到。总的来说 GraalVM 可以分为两部分内容来看

- 首先，**GraalVM 是一个完整的 JDK 发行版本**，从这一点它是与 OpenJDK 对等的，可以运行任何面向jvm的语言开发的应用；
- 其次，**GraalVM提供了 Native Image 打包技术**，这可以将应用打包为可以独立运行的二进制包，这个包是自包含的、可脱离 JVM 运行的应用程序。

![image.png](/imgs/blog/2023/6/graalvm/graalvm-compilation.png)

如上图所示，GraalVM 编译器提供了 JIT 和 AOT 两种模式。

- 对于 JIT 而言，我们都知道Java类会被编译为 .class 格式的文件，这里编译后就是 jvm 识别的字节码，在 Java 应用运行的过程中，而 JIT 编译器又将一些热点路径上的字节码编译为机器码，已实现更快的执行速度；
- 对于 AOT 模式来说，它直接在编译期间就将字节码转换为机器码，直接省去了运行时对jvm的依赖，由于省去了 jvm 加载和字节码运行期预热的时间，AOT 编译和打包的程序具有非常高的运行时效率。

![image.png](/imgs/blog/2023/6/graalvm/graalvm-compilation2.png)

总的来说，JIT 使得应用可以具备更高的极限处理能力，可以降低请求的最大延迟这一关键指标；而 AOT 则可以进一步的提升应用的冷启动速度、具有更小的二进制包提及、在运行态需要更少的内存等资源。

## 什么是 Native Image？

我们上面多次提到 GraalVM 中 Native Image 概念，Native Image 是一项将 Java 代码编译打包为可执行二进制程序的技术，打出的包中仅包含运行期所需要的代码，包括应用自身代码、标准依赖包、 语言运行时、JDK 库关联的静态代码。这个包的运行不再需要 jvm 环境，当然它是和具体的机器环境相绑定的，需要为不同的机器环境单独打包。 Native Image 有这里列出来的一系列特点：

- 仅包含 JVM 运行所需的一部分资源，运行成本更低
- 毫秒级的启动时间
- 启动后即进入最佳状态，无需预热
- 可打包为更轻量的二进制包，让部署速度更快更高效
- 安全程度更高

![image.png](/imgs/blog/2023/6/graalvm/graalvm-advantages.png)

总结起来就是这里的关键几项：更快的启动速度、更少的资源占用、更小的安全漏洞风险、更紧凑的二进制包体积。解决 Java 应用在 Sererless 等云计算应用场景中面临的突出问题。

## GraalVM Native Image 的基本原理与使用

接下来，我们看一下 GraalVM 的基本使用方式，首先，需要安装 native-image 需要的相关基础依赖，根据不同的操作系统环境会有所差异，接下来可以使用 GraalVM JDK 下载器下载 native-image。都安装好之后，第二步，就可以使用 native-image 命令编译和打包 Java 应用了，输入可以是 class 文件、jar文件、Java模块等，最终打包为一个可独立运行的可执行文件，比如这里的 HelloWorld。另外，GraalVM 也提供了对应的 Maven和Gradle构建工具插件，让打包过程更容易。

![image.png](/imgs/blog/2023/6/graalvm/graalvm-principal.png)

GraalVM 基于叫做 “closed world assumption” 即封闭世界假设的概念，要求在编译期间程序的所有运行时资源和行为即能被完全确定下来。图中是具体的 AOT 编译和打包过程，左侧应用代码、仓库、jdk等全部作为输入，GraalVM以 main 为入口，扫描所有可触达的代码与执行路径，在处理过程中可能会涉及到一些前置初始化动作，最终 AOT 编译的机器码和一些初始化资源等状态数据，被打包为可执行的 Native 包。

相比于传统的 JVM 部署模式，GraalVM Native Image 模式带来的非常大的不同。

- GraalVM 在编译构建期间就会以 main 函数为入口，完成对应用代码的静态分析
- 在静态分析期间无法被触达的代码，将会被移除，不会包含在最终的二进制包中
- GraalVM 无法识别代码中的一些动态调用行为，如反射、resource资源加载、序列化、动态代理等都动态行为都将受限
- Classpath 在构建阶段就固化下来，无法修改
- 不再支持延迟的类加载，所有可用类和代码在程序启动阶段就确定了
- 还有一些其他的 Java 应用能力是受限使用的（比如类初始化提前等）

GraalVM 不支持反射等动态特性，而我们的很多应用和框架中却大量使用了反射、动态代理等特性，如何才能将这些应用打包为 Native Image 实现静态化那？ GraalVM 提供了元数据配置入口，通过为所有动态特性提供配置文件，“closed world assumption” 模式还是成立的，可以让 GraalVM 在编译期知道所有的预期行为。这里给了两个例子：

1. 编码方式上，比如这里反射的编码方式，可以让 GraalVM 通过代码分析计算 Metadata

![image.png](/imgs/blog/2023/6/graalvm/metadata-1.png)

![image.png](/imgs/blog/2023/6/graalvm/metadata-2.png)

2. 另一个示例是提供额外的 json 配置文件并放在指定的目录 META-INF/native-image/<group.id>/<artifact.id> 下。

![image.png](/imgs/blog/2023/6/graalvm/metadata-3.png)
## AOT Processing
Java 应用或框架中的反射等动态特性的使用是影响 GraalVM 使用的障碍，而大量的框架都存在这个限制，如果都要求应用或者开发者提供 Metadata 配置的话将会是一项非常有挑战的任务，因此，Spring 和 Dubbo 等框架都在 AOT Compilation 即 AOT 编译之前引入了 AOT Processing 即 AOT 预处理的过程，AOT Processing 用来完成自动化的 Metadata 采集，并将 Metadata 提供给 AOT 编译器使用。

![image.png](/imgs/blog/2023/6/graalvm/aot.png)

AOT 编译机制是对所有 Java 应用通用的，但相比于 AOT 编译，AOT Processing 采集 Metadata 的过程是每个框架都不同的，因为每个框架对于反射、动态代理等都有自己的用法。
我们以一个典型的 Spring + Dubbo 的微服务应用为例，要实现这个应用的静态化打包，这里涉及到 Spring、Dubbo 以及一众第三方依赖的 Metadata 处理过程。

- Spring - Spring AOT processing
- Dubbo - Dubbo AOT processing
- Third-party libraries - Reachability Metadata

对于 Spring 来说，Spring6 中发布了 Spring AOT 机制，用来支持 Spring 应用的静态化预处理；Dubbo 最近也在 3.2 版本中发布了 Dubbo AOT 机制，让 Dubbo 相关组件可以自动化实现 Native 预处理；除了这两个与业务开发密切相关的框架，一个应用中往往还有大量的第三方依赖，这些依赖的 Metadata 也是影响静态化的关键，如果它们中有反射、类加载等行为，那么需要为它们提供 Metadata 配置，对于这些第三方应用目前有两个渠道，一个是 GraalVM 官方提供的共享空间，这里有相当一部分依赖的 Metadata 配置可供使用（https://github.com/oracle/graalvm-reachability-metadata），另一种方式则是要求组件官方发布的发布中包含 Metadata 配置，对于这两种情况 GraalVM 都可以做到对于 Metadata 的自动读取。

### Spring AOT

接下来我们看一下 Spring AOT 做了哪些编译之前的预处理工作，Spring 框架中有非常多的动态特性，比如自动配置、条件 Bean 等特性。Spring AOT 就是针对针对这些动态特性，在构建阶段进行预处理，生成可供 GraalVM 使用的一系列 Metadata 输入，这里生成的内容包括：

- Spring Bean 定义相关的代码预生成，如下图展示代码段
- 在构建阶段生成动态代理相关代码
- 关于一些反射等使用的 JSON 元数据文件

![image.png](/imgs/blog/2023/6/graalvm/spring-aot.png)

### Dubbo AOT
Dubbo AOT 做的事情与 Spring AOT 非常类似，只不过 Dubbo AOT 是专门针对 Dubbo 框架特有的使用方式进行预处理，这包括：

- SPI 扩展相关的源代码生成
- 一些反射使用的 JSON 配置文件生成
- RPC 代理类代码生成

![image.png](/imgs/blog/2023/6/graalvm/dubbo-aot-1.png)

![image.png](/imgs/blog/2023/6/graalvm/dubbo-aot-2.png)

## Spring6 + Dubbo3 示例演示

接下来，我们通过一个 Spring6 + Dubbo3 的示例微服务应用，演示如何使用 Spring AOT、Dubbo AOT 等，来实现应用的 Native Image 打包。

完整的代码示例可在这里下载：[dubbo-samples-native-image](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-native-image-registry)

### 第一步：安装GraalVM

1. 在Graalvm官网根据自己的系统选取对应Graalvm版本：[https://www.graalvm.org/downloads/](https://www.graalvm.org/downloads/)
2. 根据官方文档安装 native-image：[Getting Started with Native Image](https://www.graalvm.org/latest/reference-manual/native-image/#install-native-image)

### 第二步：创建项目

这个示例应用就是普通的、常见的微服务应用，我们使用 SpringBoot3 进行应用配置开发，使用 Dubbo3 定义并发布 RPC 服务；应用构建工具使用 Maven。

![image.png](/imgs/blog/2023/6/graalvm/demo-1.png)

![image.png](/imgs/blog/2023/6/graalvm/demo-2.png)

### 第三步：配置 Maven 插件

重点是增加 spring-boot-maven-plugin、native-maven-plugin、dubbo-maven-plugin 三个插件配置，开启 AOT 处理过程，修改dubbo-maven-plugin中的mainClass为所需的启动类全路径。（其中API使用方式无需添加spring-boot-maven-plugin依赖。）

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
                        <version>0.9.20</version>
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

### 第四步：在Pom依赖中添加native相关的依赖

另外，对于 Dubbo 而言，由于当前一些 Native 机制依赖 JDK17 等版本，Dubbo 没有将一些包默认打包到发行版本中，因此需要增加两个额外的依赖 dubbo-spring6 适配和 dubbo-native 组件。
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

### 第五步：调整compiler、proxy、serialization和logger

同时，这个示例对于第三方组件的支持目前也是受限的，主要是第三方组件的 Reachability Metadata 。比如目前支持的网络通信或编码组件有 Netty 和 Fastjson2；支持的日志等组件为 Logback；微服务组件有 Nacos、Zookeeper 等。

- 序列化方式目前支持的比较好的是Fastjson2
- compiler、proxy目前只能选择jdk
- logger目前需要配置slf4j，目前仅支持logback

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

### 第六步：编译

在项目根路径下执行以下编译命令：

- API方式直接执行

```
 mvn clean install -P native -Dmaven.test.skip=true
```

- 注解和xml方式（Springboot3集成的方式）

```shell
 mvn clean install -P native native:compile -Dmaven.test.skip=true
```

### 第七步：执行二进制文件即可

二进制文件在 target/ 目录下，一般以工程名称为二进制包的名称，比如 target/native-demo

## 总结

GraalVM 技术为 Java 在云计算时代的应用带来了新的变革，帮助解决了 Java 应用启动慢、资源占用，但同时我们也看到了 GraalVM 的使用也存在一些限制，因此 Spring6、SpringBoot3、Dubbo3 都提供了相应的 Native 解决方案。 Apache Dubbo 社区接下来将在周边生态组件等推进整体的 Native 静态化。
