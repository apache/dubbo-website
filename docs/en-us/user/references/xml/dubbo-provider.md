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
# dubbo:provider

The default configuration of service provider. The corresponding class is `com.alibaba.dubbo.config.ProviderConfig`. This tag provider default values for `<dubbo:service>` and `<dubbo:protocol>`.

| Attribute     | Corresponding URL parameter | Type           | Required | Default Value                            | Function                  | Description                              | Compatibility |
| ------------- | --------------------------- | -------------- | -------- | ---------------------------------------- | ------------------------- | ---------------------------------------- | ------------- |
| id            |                             | string         | False    | dubbo                                    | Configuration association | Bean Id of the protocol, can be referenced in &lt;dubbo:service proivder=""&gt; | Above 1.0.16  |
| protocol      | &lt;protocol&gt;            | string         | False    | dubbo                                    | Performance optimize      | Protocol name                            | Above 1.0.16  |
| host          | &lt;host&gt;                | string         | False    | Find local IP automatically              | Service discovery         | The host name of services, to specify VIP and domain, or having multiple network cards. If null, it will find local IP automatically. It's recommended to let Dubbo find local IP automatically | Above 1.0.16  |
| threads       | threads                     | int            | False    | 200                                      | Performance optimize      | The size of the services' Thread Pool(Fixed) | Above 1.0.16  |
| payload       | payload                     | int            | False    | 8388608(=8M)                            | Performance optimize      | The length limit of request and response, unit is byte | Above 2.0.0   |
| path          | &lt;path&gt;                | string         | False    |                                          | Service discovery         | Context path of the service provider, the prefix of the service path | Above 2.0.0   |
| server        | server                      | string         | False    | Default is netty for dubbo protocol, servlet for http protocol | Performance optimize      | The server implement of the protocol. For example, mina and netty for dubbo ptotocol, jetty and servlet for http protocol. | Above 2.0.0   |
| client        | client                      | string         | False    | Default is netty for dubbo protocol      | Performance optimize      | The client implement of the protocol. For example, mina and netty for dubbo protocol. | Above 2.0.0   |
| codec         | codec                       | string         | False    | dubbo                                    | Performance optimize      | Protocol encoding                        | Above 2.0.0   |
| serialization | serialization               | string         | False    | Default is hessian2 for dubbo protocol, json for http protocol | Performance optimize      | Protocol serialization, It's used when a protocol has multiple serializations. For example, `dubbo` protocol has 4 serializations, they are `dubbo`, `hessian2`, `java` and `compactedjava`, `http` protocol has `json` and `xml`. | Above 2.0.5   |
| default       |                             | boolean        | False    | false                                    | Configuration association | To specify the default protocol for support multiple protocols. | Above 1.0.16  |
| filter        | service.filter              | string         | False    |                                          | Performance optimize      | The filter name of the RPC process of the provider, use `,` to separate multiple filter names. | Above 2.0.5   |
| listener      | exporter.listener           | string         | False    |                                          | Performance optimize      | The listener name of the provider, use `,` to separate multiple listener names. | Above 2.0.5   |
| threadpool    | threadpool                  | string         | False    | fixed                                    | Performance optimize      | The type of Thread Pool, fixed/cached are available | Above 2.0.5   |
| accepts       | accepts                     | int            | False    | 0                                        | Performance optimize      | The maximum connection count of the service provider | Above 2.0.5   |
| version       | version                     | string         | False    | 0.0.0                                    | Service discovery         | Service version. It's recommended to use 2 digitals such as `1.0`. It's necessary to upgrade version only when the service is not compatible. | Above 2.0.5   |
| group         | group                       | string         | False    |                                          | Service discovery         | The group of the service providers. It can distinguish services when it has multiple implements. | Above 2.0.5   |
| delay         | delay                       | int            | False    | 0                                        | Performance optimize      | The delay time(ms) for registering services.  When set to -1, it indicates that the services will expose to registry after the Spring context is initialized | Above 2.0.5   |
| timeout       | default.timeout             | int            | False    | 1000                                     | Performance optimize      | The RPC timeout(ms)                      | Above 2.0.5   |
| retries       | default.retries             | int            | False    | 2                                        | Performance optimize      | The retry count for RPC, not including the first invoke. Please set it to 0 if don't need to retry. | Above 2.0.5   |
| connections   | default.connections         | int            | False    | 0                                        | Performance optimize      | The maximum connections of every provider. For short connection such as rmi, http and hessian, it's connection limit, but for long connection such as dubbo, it's connection count. | Above 2.0.5   |
| loadbalance   | default.loadbalance         | string         | False    | random                                   | Performance optimize      | Strategy of load balance, `random`, `roundrobin` and `leastactive` are available. | Above 2.0.5   |
| async         | default.async               | boolean        | False    | false                                    | Performance optimize      | Asynchronous execution, not reliable. It does not block the execution thread just only ignores the return value. | Above 2.0.5   |
| stub          | stub                        | boolean        | False    | false                                    | Service governance        | `true` means use the default proxy class name, which is the interface name with `Local` as the suffix. | Above 2.0.5   |
| mock          | mock                        | boolean        | False    | false                                    | Service governance        | `true` means use the default mock class name, which is the interface name with `Mock` suffix. | Above 2.0.5   |
| token         | token                       | boolean        | False    | false                                    | Service governance        | Enable token validation. Disable token if it's null. It will generate token randomly when it is enable. | Above 2.0.5   |
| registry      | registry                    | string         | False    | By default, register to all registries   | Configuration association | Register services to specified registry while having multiple registries. It is the `id` value of the &lt;dubbo:registry&gt;. If don't want to register to any registry, set it as `N/A` | Above 2.0.5   |
| dynamic       | dynamic                     | boolean        | False    | true                                     | Service governance        | Whether the service is registered dynamically. If false, services will be showed as `disable`, you need to enable it manually. And you also need to disable it when provider shut down. | Above 2.0.5   |
| accesslog     | accesslog                   | string/boolean | False    | false                                    | Service governance        | `true` will write access log to logger. Specifying it to a log path, you can write access logs to special log file. | Above 2.0.5   |
| owner         | owner                       | string         | False    |                                          | Service governance        | The owner of the service. It's used for service governance. | Above 2.0.5   |
| document      | document                    | string         | False    |                                          | Service governance        | Service document URL                     | Above 2.0.5   |
| weight        | weight                      | int            | False    |                                          | Performance optimize      | The weight of the service                | Above 2.0.5   |
| executes      | executes                    | int            | False    | 0                                        | Performance optimize      | The maximum parallel execution request count per method per service for the provider. | Above 2.0.5   |
| actives       | default.actives             | int            | False    | 0                                        | Performance optimize      | The maximum concurrent calls per method per service of the consumer. | Above 2.0.5   |
| proxy         | proxy                       | string         | False    | javassist                                | Performance optimize      | The proxy implement, jdk/javassist are available. | Above 2.0.5   |
| cluster       | default.cluster             | string         | False    | failover                                 | Performance optimize      | failover/failfast/failsafe/failback/forking are available. | Above 2.0.5   |
| deprecated    | deprecated                  | boolean        | False    | false                                    | Service governance        | Mark the service is deprecated. If true, there will log an error log on the client side. | Above 2.0.5   |
| queues        | queues                      | int            | False    | 0                                        | Performance optimize      | The queue size of the Thread Pool. It's recommended not to specify it in order to invoke other provides rather than queueing unless you have special requirement. | Above 2.0.5   |
| charset       | charset                     | string         | False    | UTF-8                                    | Performance optimize      | Serialization encoding                   | Above 2.0.5   |
| buffer        | buffer                      | int            | False    | 8192                                     | Performance optimize      | The buffer size of networking IO         | Above 2.0.5   |
| iothreads     | iothreads                   | int            | False    | CPU + 1                                  | Performance optimize      | The size of io Thread Pool(Fixed). These threads are used to receive, serialize and deserialize IO data. See `threads` for configuring business thread pool. It's not recommended to configure this. | Above 2.0.5   |
| telnet        | telnet                      | string         | False    |                                          | Service governance        | Supported telnet commands, use `,` to separate commands. | Above 2.0.5   |
| contextpath   | contextpath                 | String         | False    | Empty string                             | Service governance        |                                          |               |
| layer         | layer                       | string         | False    |                                          | Service governance        | The biz layer of the service provider, such as biz, dao, intl:web and china:acton. | Above 2.0.7   |
