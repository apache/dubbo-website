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
# dubbo:protocol

Service provider protocol configuration. The corresponding class is `com.alibaba.dubbo.config.ProtocolConfig`. If you need to support multiple protocols, you could declare multiple `<dubbo:protocol>` tags, and specify the protocol via `protocol` property.

| Attribute     | Corresponding URL parameter | Type           | Required    | Default Value                            | Function                  | Description                              | Compatibility |
| ------------- | --------------------------- | -------------- | ----------- | ---------------------------------------- | ------------------------- | ---------------------------------------- | ------------- |
| id            |                             | string         | False       | dubbo                                    | Configuration association | Bean Id of the protocol, can be referenced in &lt;dubbo:service protocol=""&gt; The default value is equal to the value of `name` attribute while `id` is not filled. If `name` value has already existed, it will add index to it's suffix. | Above 2.0.5   |
| name          | &lt;protocol&gt;            | string         | <b>True</b> | dubbo                                    | Performance optimize      | Protocol name                            | Above 2.0.5   |
| port          | &lt;port&gt;                | int            | False       | The default port of dubbo protocol is 20880, rmi protocol is 1099, http and hessian protocol are 80；It will allocate an unused port if `port` is not filled or equals `-1`. To ensure the ports scope is controllable, the port will increase based on the corresponding protocol default port after Dubbo 2.4.0+ | Service discovery         | Service port                             | Above 2.0.5   |
| host          | &lt;host&gt;                | string         | False       | Find local IP automatically              | Service discovery         | &#45;The host name of services, to specify VIP and domain, or having multiple network cards. If null, it will find local IP automatically&#45; It's recommended to let Dubbo find local IP automatically | Above 2.0.5   |
| threadpool    | threadpool                  | string         | False       | fixed                                    | Performance optimize      | The type of Thread Pool, fixed/cached are available | Above 2.0.5   |
| threads       | threads                     | int            | False       | 100                                      | Performance optimize      | The size of the services' Thread Pool(Fixed) | Above 2.0.5   |
| iothreads     | threads                     | int            | False       | The count of CPU + 1                     | Performance optimize      | The size of io Thread Pool(Fixed)        | Above 2.0.5   |
| accepts       | accepts                     | int            | False       | 0                                        | Performance optimize      | The maximum connection count of the service provider | Above 2.0.5   |
| payload       | payload                     | int            | False       | 88388608(=8M)                            | Performance optimize      | The length limit of request and response, unit is byte | Above 2.0.5   |
| codec         | codec                       | string         | False       | dubbo                                    | Performance optimize      | Protocol encoding                        | Above 2.0.5   |
| serialization | serialization               | string         | False       | The default serialization of dubbo protocol is hessian2, rmi protocol is java, http protocol is json | Performance optimize      | Protocol serialization, It's used when a protocol has multiple serializations. For example, `dubbo` protocol has 4 serializations, they are `dubbo`, `hessian2`, `java` and `compactedjava`. | Above 2.0.5   |
| accesslog     | accesslog                   | string/boolean | False       |                                          | Service discovery         | `true` will write access log to logger. Specifying it to a log path, you can write access logs to special log file. | Above 2.0.5   |
| path          | &lt;path&gt;                | string         | False       |                                          | Service discovery         | Context path, the prefix of the service path | Above 2.0.5   |
| transporter   | transporter                 | string         | False       | The default value of dubbo protocol is netty | Performance optimize      | The server and client implements of the protocol. For example, mina and netty for dubbo protocol. You can configure server or client side separately. | Above 2.0.5   |
| server        | server                      | string         | False       | The default value of dubbo protocol is netty, http protocol is servlet | Performance optimize      | The server implement of the protocol. For example, mina and netty for dubbo ptotocol, jetty and servlet for http protocol. | Above 2.0.5   |
| client        | client                      | string         | False       | The default value of dubbo protocol is netty | Performance optimize      | The client implement of the protocol. For example, mina and netty for dubbo protocol. | Above 2.0.5   |
| dispatcher    | dispatcher                  | string         | False       | The default value of dubbo protocol is all | Performance optimize      | specify the thread model of the way to dispatching. Such as `all`, `direct`, `message`, `execution`, and `connection` for dubbo protocol. | Above 2.1.0   |
| queues        | queues                      | int            | False       | 0                                        | Performance optimize      | The queue size of the Thread Pool. It's recommended not to specify it in order to invoke other provides rather than queueing unless you have special requirement. | Above 2.0.5   |
| charset       | charset                     | string         | False       | UTF-8                                    | Performance optimize      | Serialization encoding                   | Above 2.0.5   |
| buffer        | buffer                      | int            | False       | 8192                                     | Performance optimize      | The buffer size of networking IO         | Above 2.0.5   |
| heartbeat     | heartbeat                   | int            | False       | 0                                        | Performance optimize      | Heartbeat interval. For long connection, it's difficult to receive closing event while the physical layer is disconnected. So heartbeat is necessary to help checking the connection quality | Above 2.0.10  |
| telnet        | telnet                      | string         | False       |                                          | Service discovery         | Supported telnet commands, use `,` to separate commands. | Above 2.0.5   |
| register      | register                    | boolean        | False       | true                                     | Service discovery         | Whether registering the corresponding services to registry center | Above 2.0.8   |
| contextpath   | contextpath                 | String         | False       | Default value is an empty string         | Service discovery         |                                          | Above 2.0.6   |
