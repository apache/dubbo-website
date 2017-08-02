<style>
table {
  width: 100%;
  max-width: 65em;
  border: 1px solid #dedede;
  margin: 15px auto;
  border-collapse: collapse;
  empty-cells: show;
}
table th,
table td {
  height: 35px;
  border: 1px solid #dedede;
  padding: 0 10px;
}
table th {
  font-weight: bold;
  text-align: center !important;
  background: rgba(158,188,226,0.2);
  white-space: nowrap;
}
table tbody tr:nth-child(2n) {
  background: rgba(158,188,226,0.12);
}
table td:nth-child(1) {
  white-space: nowrap;
}
table tr:hover {
  background: #efefef;
}
.table-area {
  overflow: auto;
}
</style>

<script type="text/javascript">
[].slice.call(document.querySelectorAll('table')).forEach(function(el){
    var wrapper = document.createElement('div');
    wrapper.className = 'table-area';
    el.parentNode.insertBefore(wrapper, el);
    el.parentNode.removeChild(el);
    wrapper.appendChild(el);
})
</script>

服务消费者缺省值配置：  
配置类：com.alibaba.dubbo.config.ConsumerConfig  
说明：该标签为|&lt;dubbo:reference&gt;标签的缺省值设置。

|标签 | 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性|
| -------- |---------|---------|---------|---------|---------|---------|---------|---------|
|&lt;dubbo:consumer&gt; | timeout | default.timeout | int | 可选 | 1000 | 性能调优 | 远程服务调用超时时间(毫秒) | 1.0.16以上版本|
|&lt;dubbo:consumer&gt; | retries | default.retries | int | 可选 | 2 | 性能调优 | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0 | 1.0.16以上版本|
|&lt;dubbo:consumer&gt; | loadbalance | default.loadbalance | string | 可选 | random | 性能调优 | 负载均衡策略，可选值：random,roundrobin,leastactive，分别表示：随机，轮循，最少活跃调用 | 1.0.16以上版本|
|&lt;dubbo:consumer&gt; | async | default.async | boolean | 可选 | false | 性能调优 | 是否缺省异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 2.0.0以上版本|
|&lt;dubbo:consumer&gt; | connections | default.connections | int | 可选 | 100 | 性能调优 | 每个服务对每个提供者的最大连接数，rmi、http、hessian等短连接协议支持此配置，dubbo协议长连接不支持此配置 | 1.0.16以上版本|
|&lt;dubbo:consumer&gt; | generic | generic | boolean | 可选 | false | 服务治理 | 是否缺省泛化接口，如果为泛化接口，将返回GenericService | 2.0.0以上版本|
|&lt;dubbo:consumer&gt; | check | check | boolean | 可选 | true | 服务治理 | 启动时检查提供者是否存在，true报错，false忽略 | 1.0.16以上版本|
|&lt;dubbo:consumer&gt; | proxy | proxy | string | 可选 | javassist | 性能调优 | 生成动态代理方式，可选：jdk/javassist | 2.0.5以上版本|
|&lt;dubbo:consumer&gt; | owner | owner | string | 可选 |   | 服务治理 | 调用服务负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.0.5以上版本|
|&lt;dubbo:consumer&gt; | actives | default.actives | int | 可选 | 0 | 性能调优 | 每服务消费者每服务每方法最大并发调用数 | 2.0.5以上版本|
|&lt;dubbo:consumer&gt; | cluster | default.cluster | string | 可选 | failover | 性能调优 | 集群方式，可选：failover/failfast/failsafe/failback/forking | 2.0.5以上版本|
|&lt;dubbo:consumer&gt; | filter | reference.filter | string | 可选 |   | 性能调优 | 服务消费方远程调用过程拦截器名称，多个名称用逗号分隔 | 2.0.5以上版本|
|&lt;dubbo:consumer&gt; | listener | invoker.listener | string | 可选 |   | 性能调优 | 服务消费方引用服务监听器名称，多个名称用逗号分隔 | 2.0.5以上版本|
|&lt;dubbo:consumer&gt; | registry |   | string | 可选 | 缺省向所有registry注册 | 配置关联 | 向指定注册中心注册，在多个注册中心时使用，值为|&lt;dubbo:registry&gt;的id属性，多个注册中心ID用逗号分隔，如果不想将该服务注册到任何registry，可将值设为N/A | 2.0.5以上版本|
|&lt;dubbo:consumer&gt; | layer | layer | string | 可选 |   | 服务治理 | 服务调用者所在的分层。如：biz、dao、intl:web、china:acton。 | 2.0.7以上版本|
|&lt;dubbo:consumer&gt; | init | init | boolean | 可选 | false | 性能调优 | 是否在afterPropertiesSet()时饥饿初始化引用，否则等到有人注入或引用该实例时再初始化。 | 2.0.10以上版本|
|&lt;dubbo:consumer&gt; | cache | cache | string/boolean | 可选 |   | 服务治理 | 以调用参数为key，缓存返回结果，可选：lru, threadlocal, jcache等 | Dubbo2.1.0及其以上版本支持|
|&lt;dubbo:consumer&gt; | validation | validation | boolean | 可选 |   | 服务治理 | 是否启用JSR303标准注解验证，如果启用，将对方法参数上的注解进行校验 | Dubbo2.1.0及其以上版本支持|