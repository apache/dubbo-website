# thrift://

The current dubbo support thrift protocol is an extension of the thrift native protocol, adding some additional header information to the native protocol, such as service name, magic number, and so on.

The use of dubbo thrift protocol also need to use thrift idl compiler to generate the corresponding java code, follow-up version will do some enhancement in this aspect.

## dependency

```xml
<dependency>
    <groupId>org.apache.thrift</groupId>
    <artifactId>libthrift</artifactId>
    <version>0.8.0</version>
</dependency>
```

## Configuration


```xml
<dubbo:protocol name="thrift" port="3030" />
```

## Example

you can check [dubbo thrift example](https://github.com/apache/incubator-dubbo/tree/master/dubbo-rpc/dubbo-rpc-thrift/src/test/java/com/alibaba/dubbo/rpc/protocol/thrift/examples)

## Common problem

* Thrift does not support null values, that is, you can not pass null values


