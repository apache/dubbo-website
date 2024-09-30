---
aliases:
    - /en/overview/mannual/java-sdk/reference-manual/protocol/thrift/
description: Thrift Protocol
linkTitle: Thrift Protocol
title: Thrift Protocol
type: docs
weight: 4
---




The Thrift protocol currently supported by Dubbo is an extension of the native Thrift protocol [^1], adding some extra header information on top of the base protocol, such as service name, magic number, etc.

{{% alert title="Note" color="primary" %}}
Version `2.3.0` and above supported
{{% /alert %}}

Using the Dubbo Thrift protocol also requires the Thrift IDL compiler to compile and generate the corresponding Java code. Future versions will enhance this aspect.

## Dependencies

```xml
<dependency>
    <groupId>org.apache.thrift</groupId>
    <artifactId>libthrift</artifactId>
    <version>0.8.0</version>
</dependency>
```

## Configuration

All services share a common port [^2]:

```xml
<dubbo:protocol name="thrift" port="3030" />
```

## Usage

Refer to the [example code in the Dubbo project](https://github.com/apache/dubbo/tree/master/dubbo-rpc/dubbo-rpc-thrift/src/test/java/org/apache/dubbo/rpc/protocol/thrift)

## Frequently Asked Questions

* Thrift does not support null values, meaning: null values cannot be passed in the protocol.

[^1]: [Thrift](http://thrift.apache.org) is an RPC framework donated by Facebook to Apache.
[^2]: Not compatible with native Thrift.

