---
type: docs
title: "Thrift protocol"
linkTitle: "Thrift protocol"
weight: 7
---


## Feature description
The thrift protocol currently supported by dubbo is an extension of the thrift native protocol, adding some additional header information on the basis of the native protocol, such as service name, magic number, etc. `2.3.0` and above are supported.

[Thrift](http://thrift.apache.org) is an RPC framework donated by Facebook to Apache.

Using the dubbo thrift protocol also needs to use thrift's idl compiler to compile and generate the corresponding java code, and some enhancements will be made in this regard in subsequent versions.

## scenes to be used

For SOA standard RPC framework.

## How to use
### Dependencies

Starting from Dubbo 3, the Thrift protocol is no longer embedded in Dubbo, and an independent [module](/zh-cn/download/spi-extensions/#dubbo-rpc) needs to be introduced separately.
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-native-thrift</artifactId>
    <version>1.0.0</version>
</dependency>
```


```xml
<dependency>
    <groupId>org.apache.thrift</groupId>
    <artifactId>libthrift</artifactId>
    <version>0.8.0</version>
</dependency>
```

### All services share one port

Incompatible with native Thrift
```xml
<dubbo:protocol name="thrift" port="3030" />
```

[Example code in dubbo project](https://github.com/apache/dubbo/tree/master/dubbo-rpc/dubbo-rpc-thrift/src/test/java/org/apache/dubbo/rpc/protocol /thrift)


> Thrift does not support null values, ie: you cannot pass null values in the protocol
