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
# dubbo:service

The configuration of the service provider. The corresponding class is `com.alibaba.dubbo.config.ServiceConfig`.

| Attribute   | Corresponding URL parameter | Type           | Required    | Default Value                         | Function                  | Description                              | Compatibility |
| ----------- | --------------------------- | -------------- | ----------- | ------------------------------------- | ------------------------- | ---------------------------------------- | ------------- |
| interface   |                             | class          | <b>True</b> |                                       | Service discovery         | The service interface name               | Above 1.0.0   |
| ref         |                             | object         | <b>True</b> |                                       | Service discovery         | The reference to the service implementation | Above 1.0.0   |
| version     | version                     | string         | False       | 0.0.0                                 | Service discovery         | Service version. It's recommended to use 2 digitals such as `1.0`. It's necessary to upgrade version only when the service is not compatible. | Above 1.0.0   |
| group       | group                       | string         | False       |                                       | Service discovery         | The group of the service providers. It can distinguish services when it has multiple implements. | Above 1.0.7   |
| path        | &lt;path&gt;                | string         | False       | default value is the interface name   | Service discovery         | In 1.0, service path is not supported, it's always equals to the interface name. So it may not compitable when a service reference in 1.0 calls a service provider in 2.0 that specified path. | Above 1.0.12  |
| delay       | delay                       | int            | False       | 0                                     | Performance optimize      | The delay time(ms) for registering services.  When set to -1, it indicates that the services will expose to registry after the Spring context is initialized | Above 1.0.14  |
| timeout     | timeout                     | int            | False       | 1000                                  | Performance optimize      | The RPC timeout(ms)                      | Above 2.0.0   |
| retries     | retries                     | int            | False       | 2                                     | Performance optimize      | The retry count for RPC, not including the first invoke. Please set it to 0 if don't need to retry. | Above 2.0.0   |
| connections | connections                 | int            | False       | 100                                   | Performance optimize      | The maximum connections of every provider. For short connection such as rmi, http and hessian, it's connection limit, but for long connection such as dubbo, it's connection count. | Above 2.0.0   |
| loadbalance | loadbalance                 | string         | False       | random                                | Performance optimize      | Strategy of load balance, `random`, `roundrobin` and `leastactive` are available. | Above 2.0.0   |
| async       | async                       | boolean        | False       | false                                 | Performance optimize      | Asynchronous execution, not reliable. It does not block the execution thread just only ignores the return value. | Above 2.0.0   |
| stub        | stub                        | class/boolean  | False       | false                                 | Service governance        | `true` means use the default proxy class name, which is the interface name with `Local` as the suffix. It's used to execute local logic such as caching. The proxy class must have a constructor with the remote proxy object as a parameter, such as `public XxxServiceLocal(XxxService xxxService)` | Above 2.0.0   |
| mock        | mock                        | class/boolean  | False       | false                                 | Service governance        | `true` means use the default mock class name, which is the interface name with `Mock` suffix. It's called when the RPC is failed, such as timeout or IO exception. The mock class must carry a  none parameter constructor. The difference between mock and local proxy is that local proxy is always invoked before RPC but mock is invoked only when exception after RPC. | Above 2.0.0   |
| token       | token                       | string/boolean | False       | false                                 | Service governance        | Enable token validation. Disable token if it's null. It will generate token randomly when enable, or will use static token.  The token is designed to prevent consumers from bypassing the registry direct access to provider. If you want peer to peer, token validation must disbable. | Above 2.0.0   |
| registry    |                             | string         | False       | register to all registries by default | Configuration association | Register services to specified registry while having multiple registries. It is the `id` value of the &lt;dubbo:registry&gt;. If don't want to register to any registry, set it as `N/A` | Above 2.0.0   |
| provider    |                             | string         | False       | use the first configured provider     | Configuration association | The reference to `<dubbo:provider>`      | Above 2.0.0   |
| deprecated  | deprecated                  | boolean        | False       | false                                 | Service governance        | Mark the service is deprecated. If true, there will log an error log on the client side. | Above 2.0.5   |
| dynamic     | dynamic                     | boolean        | False       | true                                  | Service governance        | Whether the service is registered dynamically. If false, services will be showed as `disable`, you need to enable it manually. And you also need to disable it when provider shut down. | Above 2.0.5   |
| accesslog   | accesslog                   | string/boolean | False       | false                                 | Service governance        | `true` will write access log to logger. Specifying it to a log path, you can write access logs to special log file. | Above 2.0.5   |
| owner       | owner                       | string         | False       |                                       | Service governance        | The owner of the service. It's used for service governance. | Above 2.0.5   |
| document    | document                    | string         | False       |                                       | Service governance        | Service document URL                     | Above 2.0.5   |
| weight      | weight                      | int            | False       |                                       | Performance optimize      | The weight of the service                | Above 2.0.5   |
| executes    | executes                    | int            | False       | 0                                     | Performance optimize      | The maximum parallel execution request count per method per service for the provider. | Above 2.0.5   |
| proxy       | proxy                       | string         | False       | javassist                             | Performance optimize      | The proxy implement, jdk/javassist are available. | Above 2.0.5   |
| cluster     | cluster                     | string         | False       | failover                              | Performance optimize      | failover/failfast/failsafe/failback/forking are available. | Above 2.0.5   |
| filter      | service.filter              | string         | False       | default                               | Performance optimize      | The filter name of the RPC process of the provider, use `,` to separate multiple filter names. | Above 2.0.5   |
| listener    | exporter.listener           | string         | False       | default                               | Performance optimize      | The listener name of the provider, use `,` to separate multiple listener names. |               |
| protocol    |                             | string         | False       |                                       | Configuration association | Specify the protocol for service provider. It references the `id` of `<dubbo:protocol>` tag. Use `,` to separate multiple protocols. | Above 2.0.5   |
| layer       | layer                       | string         | False       |                                       | Service governance        | The biz layer of the service provider, such as biz, dao, intl:web and china:acton. | Above 2.0.7   |
| register    | register                    | boolean        | False       | true                                  | Service governance        | Whether registering service providers to registry. | Above 2.0.8   |
