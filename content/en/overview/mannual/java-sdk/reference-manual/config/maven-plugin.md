---
description: Configuration of the Dubbo Maven Plugin
linkTitle: Maven Plugin Configuration
title: Configuration of the Dubbo Maven Plugin
type: docs
weight: 3
---

This article mainly explains the configuration of the Dubbo Maven Plugin.

The current Dubbo Maven Plugin supports the following features:
- Dubbo Maven Plugin For Protobuf: Generates Stub code for Dubbo service interfaces
- Dubbo Maven Plugin For Native Image: Generates necessary Metadata information for Native Image based on AOT mechanism

## Dubbo Maven Plugin For Protobuf

### How to use Dubbo Maven Plugin to generate Protobuf Stub code

#### 1. Write the .proto file

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

#### 2. Include the dubbo-maven-plugin dependency

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

#### 3. Example of generated file

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

### Configuration List

Dubbo Maven Plugin For Protobuf supports the following configurations:

| Configuration Parameter    | Required | Description                                               | Default Value                                                | Example                                                                    |
|----------------------------|----------|-----------------------------------------------------------|------------------------------------------------------------|----------------------------------------------------------------------------|
| dubboVersion               | true     | Dubbo version number, used to find the dubbo-compiler component | ${dubbo.version}                                           | 3.3.0                                                                     |
| dubboGenerateType          | true     | Type of the generated file                                | tri                                                        | tri or tri-reactor                                                        |
| protocExecutable           | false    | Path to the executable protoc; if not configured, it will be downloaded from Maven repository |                                                            | protoc                                                                    |
| protocArtifact             | false    | The protocol used to locate protoc in Maven repository, if not configured, it will automatically detect the OS type and download |                                                            | com.google.protobuf:protoc:${protoc.version}:exe:${os.detected.classifier} |
| protoSourceDir             | true     | Directory for proto files                                 | ${basedir}/src/main/proto                                  | ./proto                                                                   |
| outputDir                  | true     | Target directory for generated files                      | ${project.build.directory}/generated-sources/protobuf/java | ${basedir}/src/main/java                                                  |
| protocPluginDirectory       | false    | Directory for temporary storage of protoc                 | ${project.build.directory}/protoc-plugins                  | ./target/protoc-plugins                                                   |

## Dubbo Maven Plugin For Native Image

### Example

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

### Configuration List

Dubbo Maven Plugin For Native Image supports the following configurations:

| Configuration Parameter    | Required | Description   | Default Value                                                | Example                                                                    |
|----------------------------|----------|---------------|------------------------------------------------------------|----------------------------------------------------------------------------|
| mainClass                  | true     | Name of the main class |                                           | com.example.nativedemo.NativeDemoApplication                             |

