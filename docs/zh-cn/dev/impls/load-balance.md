# 负载均衡扩展

## 扩展说明

从多个服务提者方中选择一个进行调用

## 扩展接口

`com.alibaba.dubbo.rpc.cluster.LoadBalance`

## 扩展配置

```xml
<dubbo:protocol loadbalance="xxx" />
<!-- 缺省值设置，当<dubbo:protocol>没有配置loadbalance时，使用此配置 -->
<dubbo:provider loadbalance="xxx" />
```

## 已知扩展

* `com.alibaba.dubbo.rpc.cluster.loadbalance.RandomLoadBalance`
* `com.alibaba.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance`
* `com.alibaba.dubbo.rpc.cluster.loadbalance.LeastActiveLoadBalance`

## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxLoadBalance.java (实现LoadBalance接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.cluster.LoadBalance (纯文本文件，内容为：xxx=com.xxx.XxxLoadBalance)
```

XxxLoadBalance.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.rpc.cluster.LoadBalance;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.Invocation;
import com.alibaba.dubbo.rpc.RpcException; 
 
public class XxxLoadBalance implements LoadBalance {
    public <T> Invoker<T> select(List<Invoker<T>> invokers, Invocation invocation) throws RpcException {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.LoadBalance：

```properties
xxx=com.xxx.XxxLoadBalance
```
