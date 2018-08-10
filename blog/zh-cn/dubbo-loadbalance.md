# Dubbo的负载均衡

# 背景

Dubbo是一个分布式服务框架，能避免单点故障和支持服务的横向扩容。一个服务通常会部署多个实例。如何从多个服务提供者组成的集群中挑选出一个进行调用，就涉及到一个负载均衡的策略。

# 几个概念

在讨论负载均衡之前，我想先解释一下这3个概念。

1. 负载均衡
2. 集群容错
3. 服务路由

这3个概念容易混淆。他们都描述了怎么从多个Provider中选择一个来进行调用。那他们到底有什么区别呢?下面我来举一个简单的例子，把这几个概念阐述清楚吧。

有一个Dubbo的用户服务，在北京部署了10个，在上海部署了20个。一个杭州的服务消费方发起了一次调用，然后发生了以下的事情:

1. 根据配置的路由规则，如果杭州发起的调用，会路由到比较近的上海的20个Provider。
2. 根据配置的随机负载均衡策略。在20个Provider中随机选择了一个来调用，假设随机到了第7个Provider。
3. 结果调用第7个Provider失败了。
4. 根据配置的Failover集群容错模式，重试其他服务器。
5. 重试了第13个Provider，调用成功。

上面的第1，2，4步骤就分别对应了路由，负载均衡和集群容错。 Dubbo中，先通过路由，从多个Provider中按照路由规则，选出一个子集。再根据负载均衡从子集中选出一个Provider进行本次调用。如果调用失败了，根据集群容错策略，进行重试或定时重发或快速失败等。 可以看到Dubbo中的路由，负载均衡和集群容错发生在一次RPC调用的不同阶段。最先是路由，然后是负载均衡，最后是集群容错。 本文档只讨论负载均衡，路由和集群容错在其他的文档中进行说明。

# Dubbo内置负载均衡策略

Dubbo内置了4种负载均衡策略:

1. RandomLoadBalance:随机负载均衡。随机的选择一个。是Dubbo的**默认**负载均衡策略。
2. RoundRobinLoadBalance:轮询负载均衡。轮询选择一个。
3. LeastActiveLoadBalance:最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差。使慢的提供者收到更少请求，因为越慢的提供者的调用前后计数差会越大。
4. ConsistentHashLoadBalance:一致性哈希负载均衡。相同参数的请求总是落在同一台机器上。

### 1.随机负载均衡

顾名思义，随机负载均衡策略就是从多个Provider中随机选择一个。但是Dubbo中的随机负载均衡有一个权重的概念，即按照权重设置随机概率。比如说，有10个Provider，并不是说，每个Provider的概率都是一样的，而是要结合这10个provider的权重来分配概率。

Dubbo中，可以对Provider设置权重。比如机器性能好的，可以设置大一点的权重，性能差的，可以设置小一点的权重。权重会对负载均衡产生影响。可以在Dubbo Admin中对provider进行权重的设置。

**基于权重的负载均衡算法**

随机策略会先判断所有的invoker的权重是不是一样的，如果都是一样的，那么处理就比较简单了。使用random.nexInt(length)就可以随机生成一个invoker的序号,根据序号选择对应的invoker。如果没有在Dubbo Admin中对服务提供者设置权重，那么所有的invoker的权重就是一样的，默认是100。 如果权重不一样，那就需要结合权重来设置随机概率了。算法大概如下： 假如有4个invoker

| invoker | weight |
| ------- | ------ |
| A       | 10     |
| B       | 20     |
| C       | 20     |
| D       | 30     |

A，B，C和D总的权重是10 + 20 + 20 + 30 = 80。将80个数分布在如下的图中:

```
+-----------------------------------------------------------------------------------+
|          |                    |                    |                              |
+-----------------------------------------------------------------------------------+
1          10                   30                   50                             80            

|-----A----|---------B----------|----------C---------|---------------D--------------|


---------------------15

-------------------------------------------37

-----------------------------------------------------------54
```

上面的图中一共有4块区域，长度分别是A，B，C和D的权重。使用random.nextInt(10 + 20 + 20 + 30)，从80个数中随机选择一个。然后再判断该数分布在哪个区域。比如，如果随机到37，37是分布在C区域的，那么就选择inboker C。15是在B区域，54是在D区域。

**随机负载均衡源码**

下面是随机负载均衡的源码，为了方便阅读和理解，我把无关部分都去掉了。

```
public class RandomLoadBalance extends AbstractLoadBalance {

    private final Random random = new Random();

    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        int length = invokers.size();      // invoker总数
        int totalWeight = 0;               // 所有invoker的权重的和
        
        // 判断是不是所有的invoker的权重都是一样的
        // 如果权重都一样，就简单了。直接用Random生成索引就可以了。
        boolean sameWeight = true; 
        for (int i = 0; i < length; i++) {
            int weight = getWeight(invokers.get(i), invocation);
            totalWeight += weight; // Sum
            if (sameWeight && i > 0 && weight != getWeight(invokers.get(i - 1), invocation)) {
                sameWeight = false;
            }
        }
        
        if (totalWeight > 0 && !sameWeight) {
            // 如果不是所有的invoker权重都相同，那么基于权重来随机选择。权重越大的，被选中的概率越大
            int offset = random.nextInt(totalWeight);
            for (int i = 0; i < length; i++) {
                offset -= getWeight(invokers.get(i), invocation);
                if (offset < 0) {
                    return invokers.get(i);
                }
            }
        }
        // 如果所有invoker权重相同
        return invokers.get(random.nextInt(length));
    }
}
```

### 2.轮循负载均衡

轮询负载均衡，就是依次的调用所有的Provider。和随机负载均衡策略一样，轮询负载均衡策略也有权重的概念。 轮询负载均衡算法可以让RPC调用严格按照我们设置的比例来分配。不管是少量的调用还是大量的调用。但是轮询负载均衡算法也有不足的地方，存在慢的提供者累积请求的问题，比如：第二台机器很慢，但没挂，当请求调到第二台时就卡在那，久而久之，所有请求都卡在调到第二台上，导致整个系统变慢。

### 3.最少活跃调用数负载均衡

官方解释：

> 最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差，使慢的机器收到更少。

 这个解释好像说的不是太明白。知道了目的是让慢的机器收到更少，但具体怎么实现的还是不太清楚。让我来举个例子吧： 例如，每个服务维护一个活跃数计数器。当A机器开始处理请求，该计数器加1，此时A还未处理完成。若处理完毕则计数器减1。而B机器接受到请求后很快处理完毕。那么A,B的活跃数分别是1，0。当又产生了一个新的请求，则选择B机器去执行(B活跃数最小)，这样使慢的机器A收到少的请求。

处理一个新的请求时，Consumer会检查所有Provider的活跃数，如果具有最小活跃数的invoker只有一个，直接返回该Invoker：

```
if (leastCount == 1) {
    // 如果只有一个最小则直接返回
    return invokers.get(leastIndexs[0]);
}
```

如果最小活跃数的invoker有多个，且权重不相等同时总权重大于0，这时随机生成一个权重，范围在0，totalWeight 间内。最后根据随机生成的权重，来选择invoker。

```
if (! sameWeight && totalWeight > 0) {
    // 如果权重不相同且权重大于0则按总权重数随机
    int offsetWeight = random.nextInt(totalWeight);
    // 并确定随机值落在哪个片断上
    for (int i = 0; i < leastCount; i++) {
        int leastIndex = leastIndexs[i];
        offsetWeight -= getWeight(invokers.get(leastIndex), invocation);
        if (offsetWeight <= 0)
            return invokers.get(leastIndex);
    }
}
```

### 4.一致性Hash算法

使用一致性 Hash，让相同参数的请求总是发到同一提供者。 当某一台提供者挂时，原本发往该提供者的请求，基于虚拟节点，平摊到其它提供者，不会引起剧烈变动。 算法参见：<http://en.wikipedia.org/wiki/Consistent_hashing>。

缺省只对第一个参数Hash，如果要修改，请配置:

```
<dubbo:parameter key="hash.arguments" value="0,1" />
```

缺省用160份虚拟节点，如果要修改，请配置:

```
<dubbo:parameter key="hash.nodes" value="320" />
```

一致性Hash算法可以和缓存机制配合起来使用。比如有一个服务getUserInfo(String userId)。设置了Hash算法后，相同的userId的调用，都会发送到同一个提供者。这个提供者上可以把用户数据在内存中进行缓存，减少访问数据库或分布式缓存的次数。如果业务上允许这部分数据有一段时间的不一致，可以考虑这种做法。减少对数据库，缓存等中间件的依赖和访问次数，同时减少了网络IO操作，提高系统性能。

# 负载均衡配置

如果不指定负载均衡，默认使用随机负载均衡。我们也可以根据自己的需要，显式指定一个负载均衡。 可以在多个地方类来配置负载均衡，比如Provider端，Consumer端，服务级别，方法级别等。

### 服务端服务级别

```
<dubbo:service interface="..." loadbalance="roundrobin" />
```

该服务的所有方法都使用roundrobin负载均衡。

### 客户端服务级别

```
<dubbo:reference interface="..." loadbalance="roundrobin" />
```

该服务的所有方法都使用roundrobin负载均衡。

### 服务端方法级别

```
<dubbo:service interface="...">
    <dubbo:method name="hello" loadbalance="roundrobin"/>
</dubbo:service>
```

只有该服务的hello方法使用roundrobin负载均衡。

### 客户端方法级别

```
<dubbo:reference interface="...">
    <dubbo:method name="hello" loadbalance="roundrobin"/>
</dubbo:reference>
```

只有该服务的hello方法使用roundrobin负载均衡。

和Dubbo其他的配置类似，多个配置是有覆盖关系的：

1. 方法级优先，接口级次之，全局配置再次之。
2. 如果级别一样，则消费方优先，提供方次之。

所以，上面4种配置的优先级是:

1. 客户端方法级别配置。
2. 客户端接口级别配置。
3. 服务端方法级别配置。
4. 服务端接口级别配置。

# 扩展负载均衡

Dubbo的4种负载均衡的实现，大多数情况下能满足要求。有时候，因为业务的需要，我们可能需要实现自己的负载均衡策略。本章只说明如何配置负载均衡算法。关于Dubbo扩展机制的更多内容，请前往[Dubbo可扩展机制实战](https://lark.alipay.com/aliware_articles/vtpf9h/pe9pyr)。

1. 实现LoadBalance接口 以下是Dubbo的LoadBalance接口:

```
@SPI(RandomLoadBalance.NAME)
public interface LoadBalance {
    @Adaptive("loadbalance")
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```

这是SPI的接口，select方法的参数如下:

- invokers: 所有的服务提供者列表。
- url: 一些配置信息，比如接口名，是否check，序列化方式。
- invocation: RPC调用的信息，包括方法名，方法参数类型，方法参数。 下面是我们自己实现的一个LoadBalance，实现很简单，选择第一个invoker:

```
package com.demo.dubbo;
public class DemoLoadBalance implements LoadBalance {
    @Override
    public <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException {
        System.out.println("[DemoLoadBalance]Select the first invoker...");
        return invokers.get(0);
    }
}
```

1. 添加资源文件 添加文件:`src/main/resource/META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.LoadBalance`。这是一个简单的文本文件。文件内容如下:

```
demo=my=com.demo.dubbo.DemoLoadBalance
```

1. 配置使用自定义LoadBalance

```
<dubbo:reference id="helloService" interface="com.demo.dubbo.api.IHelloService" loadbalance="demo" />
```

在consumer端的dubbo:reference中配置<loadbalance="demo">

经过上面的3个步骤，我们编写了一个自定义的LoadBalance，并告诉Dubbo使用它了。启动Dubbo，我们就能看到Dubbo已经使用了自定义的DemoLoadBalance。