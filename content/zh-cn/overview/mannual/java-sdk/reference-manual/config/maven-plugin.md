---
description: Dubbo Maven Plugin 的配置方式
linkTitle: Maven Plugin 配置
title: Dubbo Maven Plugin 的配置方式
type: docs
weight: 3
---

本文主要讲解 Dubbo Maven Plugin 的配置方式。

当前 Dubbo Maven Plugin 支持以下功能：
- Dubbo Maven Plugin For Protobuf：生成 Dubbo 服务接口的 Stub 代码
- Dubbo Maven Plugin For Native Image：基于 AOT 机制，生成 Native Image 必要的 Metadata 信息

## Dubbo Maven Plugin For Protobuf

### 如何使用 Dubbo Maven Plugin 生成 Protobuf Stub 代码

#### 1. 编写 .proto 文件

greeter.proto

```protobuf
syntax = "proto3";

option java_multiple_files = true;
option java_package = "org.apache.dubbo.demo";
option java_outer_classname = "DemoServiceProto";
option objc_class_prefix = "DEMOSRV";

package demoservice;

// The demo service definition.
service DemoService {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}

```

#### 2. 引入 dubbo-maven-plugin 依赖

```xml

<plugin>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-maven-plugin</artifactId>
    <version>${dubbo.version}</version>
    <executions>
        <execution>
            <goals>
                <goal>compile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

#### 3. 生成文件示例

```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.dubbo.demo;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

public final class DemoServiceDubbo {
    private static final AtomicBoolean registered = new AtomicBoolean();

    private static Class<?> init() {
        Class<?> clazz = null;
        try {
            clazz = Class.forName(DemoServiceDubbo.class.getName());
            if (registered.compareAndSet(false, true)) {
                org.apache.dubbo.common.serialize.protobuf.support.ProtobufUtils.marshaller(
                        org.apache.dubbo.demo.HelloReply.getDefaultInstance());
                org.apache.dubbo.common.serialize.protobuf.support.ProtobufUtils.marshaller(
                        org.apache.dubbo.demo.HelloRequest.getDefaultInstance());
            }
        } catch (ClassNotFoundException e) {
// ignore
        }
        return clazz;
    }

    private DemoServiceDubbo() {
    }

    public static final String SERVICE_NAME = "org.apache.dubbo.demo.DemoService";

    /**
     * Code generated for Dubbo
     */
    public interface IDemoService extends org.apache.dubbo.rpc.model.DubboStub {

        static Class<?> clazz = init();

        org.apache.dubbo.demo.HelloReply sayHello(org.apache.dubbo.demo.HelloRequest request);

        CompletableFuture<org.apache.dubbo.demo.HelloReply> sayHelloAsync(org.apache.dubbo.demo.HelloRequest request);


    }

}

```

### 配置列表

Dubbo Maven Plugin For Protobuf 支持以下配置：

| 配置参数                 | 必填    | 解释                                                     | 默认值                                                        | 示例                                                                        |
|----------------------|-------|--------------------------------------------------------|------------------------------------------------------------|---------------------------------------------------------------------------|
| dubboVersion         | true  | Dubbo 版本号，用于查找 dubbo-compiler 组件                       | ${dubbo.version}                                           | 3.3.0                                                                     |
| dubboGenerateType    | true  | 生成的文件类型                                                | tri                                                        | tri  或  tri-reactor                                             |
| protocExecutable     | false | 可执行的 protoc 路径，如不配置将自动从 Maven 仓库下载                     |                                                            | protoc                                                                    |
| protocArtifact       | false | protoc 在 Maven 仓库中定位，用于下载 protoc 文件，如不配置将自动识别操作系统类型并下载 |                                                            | com.google.protobuf:protoc:${protoc.version}:exe:${os.detected.classifier} |
| protoSourceDir       | true  | proto 文件目录                                             | ${basedir}/src/main/proto                                  | ./proto                                                                   |
| outputDir            | true  | 生成文件的目标目录                                              | ${project.build.directory}/generated-sources/protobuf/java | ${basedir}/src/main/java                                                  |
| protocPluginDirectory | false | 临时存储 protoc 的目录                                        | ${project.build.directory}/protoc-plugins                  | ./target/protoc-plugins                                                   |

## Dubbo Maven Plugin For Native Image

### 示例

```xml
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
```


### 配置列表

Dubbo Maven Plugin For Native Image 支持以下配置：

| 配置参数                 | 必填    | 解释   | 默认值                                                        | 示例                                                                        |
|----------------------|-------|------|------------------------------------------------------------|---------------------------------------------------------------------------|
| mainClass         | true  | 启动类名 |                                           | com.example.nativedemo.NativeDemoApplication                                                                     |
