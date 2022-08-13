---
type: docs
title: "Dubbo2 协议迁移"
linkTitle: "Dubbo2 协议迁移"
weight: 10
---

## Dubbo2 协议迁移流程

Dubbo2 的用户使用 dubbo 协议 + 自定义序列化，如 hessian2 完成远程调用。

而 Grpc 的默认仅支持 Protobuf 序列化，对于 Java 语言中的多参数以及方法重载也无法支持。

Dubbo3的之初就有一条目标是完美兼容 Dubbo2，所以为了 Dubbo2 能够平滑升级， Dubbo 框架侧做了很多工作来保证升级的无感，目前默认的序列化和 Dubbo2 保持一致为`hessian2`。

所以，如果决定要升级到 Dubbo3 的 `Triple` 协议，只需要修改配置中的协议名称为 `tri` (注意: 不是triple)即可。

接下来我们我们以一个使用 Dubbo2 协议的[工程](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration) 来举例，如何一步一步安全的升级。

1. 仅使用 `dubbo` 协议启动 `provider` 和 `consumer`，并完成调用。
2. 使用 `dubbo` 和 `tri` 协议 启动`provider`，以 `dubbo` 协议启动 `consumer`，并完成调用。
3. 仅使用 `tri` 协议 启动 `provider`和 `consumer`，并完成调用。

### 定义服务

1. 定义接口
```java
public interface IWrapperGreeter {

    //... 
    
    /**
     * 这是一个普通接口，没有使用 pb 序列化
     */
    String sayHello(String request);

}
```

2. 实现类如下
```java
public class IGreeter2Impl implements IWrapperGreeter {

    @Override
    public String sayHello(String request) {
        return "hello," + request;
    }
}
```

### 仅使用 dubbo 协议

为保证兼容性，我们先将部分 provider 升级到 `dubbo3` 版本并使用 `dubbo` 协议。

使用 `dubbo` 协议启动一个 [`Provider`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationDubboProvider.java) 和 [`Consumer`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationDubboConsumer.java) ,完成调用，输出如下:
![result](/imgs/v3/migration/tri/dubbo3-tri-migration-dubbo-dubbo-result.png)

###  同时使用 dubbo 和 triple 协议

对于线上服务的升级，不可能一蹴而就同时完成 provider 和 consumer 升级, 需要按步操作，保证业务稳定。
第二步, provider 提供双协议的方式同时支持 dubbo + tri 两种协议的客户端。

结构如图所示:
![strust](/imgs/v3/migration/tri/migrate-dubbo-tri-strust.png)

> 按照推荐升级步骤，provider 已经支持了tri协议，所以 dubbo3的 consumer 可以直接使用 tri 协议

使用`dubbo`协议和`triple`协议启动[`Provider`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationBothProvider.java)和[`Consumer`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationBothConsumer.java),完成调用，输出如下:

![result](/imgs/v3/migration/tri/dubbo3-tri-migration-both-dubbo-tri-result.png)


### 仅使用 triple 协议

当所有的 consuemr 都升级至支持 `Triple` 协议的版本后，provider 可切换至仅使用 `Triple` 协议启动

结构如图所示:
![strust](/imgs/v3/migration/tri/migrate-only-tri-strust.png)

[Provider](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationTriProvider.java)
和 [Consumer](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationTriConsumer.java) 完成调用，输出如下:

![result](/imgs/v3/migration/tri/dubbo3-tri-migration-tri-tri-result.png)

