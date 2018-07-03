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
# dubbo:reference

服务消费者引用服务配置。对应的配置类： `com.alibaba.dubbo.config.ReferenceConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| id | | string | <b>必填</b> | | 配置关联 | 服务引用BeanId | 1.0.0以上版本  |
| interface | | class | <b>必填</b> | | 服务发现 | 服务接口名 | 1.0.0以上版本  |
| version | version | string | 可选 | | 服务发现 | 服务版本，与服务提供者的版本一致 | 1.0.0以上版本  |
| group | group | string | 可选 | | 服务发现 | 服务分组，当一个接口有多个实现，可以用分组区分，必需和服务提供方一致 | 1.0.7以上版本  |
| timeout | timeout | long | 可选 | 缺省使用&lt;dubbo:consumer&gt;的timeout | 性能调优 | 服务方法调用超时时间(毫秒) | 1.0.5以上版本  |
| retries | retries | int | 可选 | 缺省使用&lt;dubbo:consumer&gt;的retries | 性能调优 | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0 | 2.0.0以上版本  |
| connections | connections | int | 可选 | 缺省使用&lt;dubbo:consumer&gt;的connections | 性能调优 | 对每个提供者的最大连接数，rmi、http、hessian等短连接协议表示限制连接数，dubbo等长连接协表示建立的长连接个数 | 2.0.0以上版本  |
| loadbalance | loadbalance | string | 可选 | 缺省使用&lt;dubbo:consumer&gt;的loadbalance | 性能调优 | 负载均衡策略，可选值：random,roundrobin,leastactive，分别表示：随机，轮循，最少活跃调用 | 2.0.0以上版本  |
| async | async | boolean | 可选 | 缺省使用&lt;dubbo:consumer&gt;的async | 性能调优 | 是否异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 2.0.0以上版本  |
| generic | generic | boolean | 可选 | 缺省使用&lt;dubbo:consumer&gt;的generic | 服务治理 | 是否缺省泛化接口，如果为泛化接口，将返回GenericService | 2.0.0以上版本  |
| check | check | boolean | 可选 | 缺省使用&lt;dubbo:consumer&gt;的check | 服务治理 | 启动时检查提供者是否存在，true报错，false忽略 | 2.0.0以上版本  |
| url | url | string | 可选 | | 服务治理 | 点对点直连服务提供者地址，将绕过注册中心 | 1.0.6以上版本  |
| stub | stub | class/boolean | 可选 | | 服务治理 | 服务接口客户端本地代理类名，用于在客户端执行本地逻辑，如本地缓存等，该本地代理类的构造函数必须允许传入远程代理对象，构造函数如：public XxxServiceLocal(XxxService xxxService) | 2.0.0以上版本  |
| mock | mock | class/boolean | 可选 | | 服务治理 | 服务接口调用失败Mock实现类名，该Mock类必须有一个无参构造函数，与Local的区别在于，Local总是被执行，而Mock只在出现非业务异常(比如超时，网络异常等)时执行，Local在远程调用之前执行，Mock在远程调用后执行。 | Dubbo1.0.13及其以上版本支持  |
| cache | cache | string/boolean | 可选 | | 服务治理 | 以调用参数为key，缓存返回结果，可选：lru, threadlocal, jcache等 | Dubbo2.1.0及其以上版本支持  |
| validation | validation | boolean | 可选 | | 服务治理 | 是否启用JSR303标准注解验证，如果启用，将对方法参数上的注解进行校验 | Dubbo2.1.0及其以上版本支持  |
| proxy | proxy | boolean | 可选 | javassist | 性能调优 | 选择动态代理实现策略，可选：javassist, jdk | 2.0.2以上版本  |
| client | client | string | 可选 | | 性能调优 | 客户端传输类型设置，如Dubbo协议的netty或mina。 | Dubbo2.0.0以上版本支持  |
| registry | | string | 可选 | 缺省将从所有注册中心获服务列表后合并结果 | 配置关联 | 从指定注册中心注册获取服务列表，在多个注册中心时使用，值为&lt;dubbo:registry&gt;的id属性，多个注册中心ID用逗号分隔 | 2.0.0以上版本  |
| owner | owner | string | 可选 | | 服务治理 | 调用服务负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.0.5以上版本  |
| actives | actives | int | 可选 | 0 | 性能调优 | 每服务消费者每服务每方法最大并发调用数 | 2.0.5以上版本  |
| cluster | cluster | string | 可选 | failover | 性能调优 | 集群方式，可选：failover/failfast/failsafe/failback/forking | 2.0.5以上版本  |
| filter | reference.filter | string | 可选 | default | 性能调优 | 服务消费方远程调用过程拦截器名称，多个名称用逗号分隔 | 2.0.5以上版本  |
| listener | invoker.listener | string | 可选 | default | 性能调优 | 服务消费方引用服务监听器名称，多个名称用逗号分隔 | 2.0.5以上版本  |
| layer | layer | string | 可选 | | 服务治理 | 服务调用者所在的分层。如：biz、dao、intl:web、china:acton。 | 2.0.7以上版本  |
| init | init | boolean | 可选 | false | 性能调优 | 是否在afterPropertiesSet()时饥饿初始化引用，否则等到有人注入或引用该实例时再初始化。 | 2.0.10以上版本  |
| protocol | protocol | string | 可选 | | 服力治理 | 只调用指定协议的服务提供方，其它协议忽略。 | 2.2.0以上版本 |
