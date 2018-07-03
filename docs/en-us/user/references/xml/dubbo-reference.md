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

The configuration of service consumer. The corresponding class is`com.alibaba.dubbo.config.ReferenceConfig`

| Attribute   | Corresponding URL parameter | Type           | Required    | Default Value                            | Function                  | Description                              | Compatibility |
| ----------- | --------------------------- | -------------- | ----------- | ---------------------------------------- | ------------------------- | ---------------------------------------- | ------------- |
| id          |                             | string         | <b>True</b> |                                          | Configuration association | Bean Id of the service reference         | Above 1.0.0   |
| interface   |                             | class          | <b>True</b> |                                          | Service discovery         | Interface name of the service            | Above 1.0.0   |
| version     | version                     | string         | False       |                                          | Service discovery         | Service version, must be equal to the provider's version | Above 1.0.0   |
| group       | group                       | string         | False       |                                          | Service discovery         | The group of the service reference, must be equal to the provider's group. It can distinguish services when it has multiple implements. | Above 1.0.7   |
| timeout     | timeout                     | long           | False       | By default, use <dubbo:consumer&gt; timeout | Performance optimize      | The RPC timeout(ms)                      | Above 1.0.5   |
| retries     | retries                     | int            | False       | By default, use &lt;dubbo:consumer&gt; retries | Performance optimize      | The retry count for RPC, not including the first invoke. Please set it to 0 if don't need to retry. | Above 2.0.0   |
| connections | connections                 | int            | False       | By default, use &lt;dubbo:consumer&gt; connections | Performance optimize      | The maximum connections of every provider. For short connection such as rmi, http and hessian, it's connection limit, but for long connection such as dubbo, it's connection count. | Above 2.0.0   |
| loadbalance | loadbalance                 | string         | False       | By default, use &lt;dubbo:consumer&gt; loadbalance | Performance optimize      | Strategy of load balance, `random`, `roundrobin` and `leastactive` are available. | Above 2.0.0   |
| async       | async                       | boolean        | False       | By default, use &lt;dubbo:consumer&gt; async | Performance optimize      | Asynchronous execution, not reliable. It does not block the execution thread just only ignores the return value. | Above 2.0.0   |
| generic     | generic                     | boolean        | False       | By default, use &lt;dubbo:consumer&gt; generic | Service governance        | Enable generic interface. If true, the reference will return `GenericService` | Above 2.0.0   |
| check       | check                       | boolean        | False       | By default, use &lt;dubbo:consumer&gt; check | Service governance        | Check the exist of the provider. If true, it will throw exception when provider is not exist. If false, will ignore. | Above 2.0.0   |
| url         | url                         | string         | False       |                                          | Service governance        | Connect to the provider directly via this url. It will bypass the registry. | Above 1.0.6   |
| stub        | stub                        | class/boolean  | False       |                                          | Service governance        | The local proxy class name of the client, it's used to execute local logic such as caching. The proxy class must have a constructor with the remote proxy object as a parameter, such as `public XxxServiceLocal(XxxService xxxService)` | Above 2.0.0   |
| mock        | mock                        | class/boolean  | False       |                                          | Service governance        | The mock class name. It's called when the RPC is failed, such as timeout or IO exception. The mock class must carry a  none parameter constructor. The difference between mock and local proxy is that local proxy is always invoked before RPC but mock is invoked only when exception after RPC. | Above 1.0.13  |
| cache       | cache                       | string/boolean | False       |                                          | Service governance        | lru, threadlocal, jcache等Using RPC parameters as the key to cache the result. `lru`, `threadlocal` and `jcache` are available. | Above 2.1.0   |
| validation  | validation                  | boolean        | False       |                                          | Service governance        | Enable JSR303 annotation validation. If true, it will validate the method parameters' annotations. | Above 2.1.0   |
| proxy       | proxy                       | boolean        | False       | javassist                                | Performance optimize      | The proxy implement, jdk/javassist are available. | Above 2.0.2   |
| client      | client                      | string         | False       |                                          | Performance optimize      | The transport type of the client, such as netty and mina for dubbo protocol. | Above 2.0.0   |
| registry    |                             | string         | False       | By default, it will merge all the service providers that getting from all registries | Configuration association | Get provider lists from the specified registry. It is the `id` value of the &lt;dubbo:registry&gt;, use `,` to separate multiple regsitries id. | Above 2.0.0   |
| owner       | owner                       | string         | False       |                                          | Service governance        | The owner of the service. It's used for service governance. | Above 2.0.5   |
| actives     | actives                     | int            | False       | 0                                        | Performance optimize      | The maximum concurrent calls per method per service of the consumer. | Above 2.0.5   |
| cluster     | cluster                     | string         | False       | failover                                 | Performance optimize      | failover/failfast/failsafe/failback/forking are available. | Above 2.0.5   |
| filter      | reference.filter            | string         | False       | default                                  | Performance optimize      | The filter name of the RPC process of the reference, use `,` to separate multiple filter names. | Above 2.0.5   |
| listener    | invoker.listener            | string         | False       | default                                  | Performance optimize      | The listener name of the reference, use `,` to separate multiple listener names. | Above 2.0.5   |
| layer       | layer                       | string         | False       |                                          | Service governance        | The biz layer of the service provider, such as biz, dao, intl:web and china:acton. | Above 2.0.7   |
| init        | init                        | boolean        | False       | false                                    | Performance optimize      | If true, init the service reference when `afterPropertiesSet()`is invoked, or it will init later only when it is referenced and autowired. | Above 2.0.10  |
| protocol    | protocol                    | string         | False       |                                          | Service governance        | Only invoke the  providers with specified protocol, and ignore other protocol providers. | Above 2.2.0   |
