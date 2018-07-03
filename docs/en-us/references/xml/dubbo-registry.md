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
# dubbo:registry

The configuration of the registry center. The corresponding class is `com.alibaba.dubbo.config.RegistryConfig`. If you have multiple different registries, you can declare multiple `<dubbo:registry>` tags, and then reference specified registry with `registry` property in `<dubbo:service>` or `<dubbo:reference>` tag.

| Attribute | Corresponding URL parameter | Type    | Required    | Default Value | Function                  | Description                              | Compatibility |
| --------- | --------------------------- | ------- | ----------- | ------------- | ------------------------- | ---------------------------------------- | ------------- |
| id        |                             | string  | False       |               | Configuration association | Bean Id of the registry center, can be referenced in &lt;dubbo:service registry=""&gt;or  &lt;dubbo:reference registry=""&gt; | Above 1.0.16  |
| address   | &lt;host:port&gt;           | string  | <b>True</b> |               | Service discovery         | The address of the registry center. If the address has no port, default port 9999 will be adopted. Multiple addresses within the same cluster use `,` to seperate, such as `ip:port,ip:port`. Multiple registries within different cluster, please configure different `dubbo:registry` tag. | Above 1.0.16  |
| protocol  | &lt;protocol&gt;            | string  | False       | dubbo         | Service discovery         | The protocol of the registry center. `dubbo`, `http`, `local` are available. | Above 2.0.0   |
| port      | &lt;port&gt;                | int     | False       | 9090          | Service discovery         | The default port of the registry. When the `address` has no port, this default port will be adopted. | Above 2.0.0   |
| username  | &lt;username&gt;            | string  | False       |               | Service governance        | The usename of the registry. Do not set it if the registry doesn't need validation. | Above 2.0.0   |
| password  | &lt;password&gt;            | string  | False       |               | Service governance        | The password of the registry. Do not set it if the registry doesn't need validation. | Above 2.0.0   |
| transport | registry.transporter        | string  | False       | netty         | Performance optimize      | mina, netty are available.               | Above 2.0.0   |
| timeout   | registry.timeout            | int     | False       | 5000          | Performance optimize      | The timeout(ms) of the request to registry. | Above 2.0.0   |
| session   | registry.session            | int     | False       | 60000         | Performance optimize      | The session timeout(ms) of the registry. It's used to check whether the providers are alive. It depends on the implement of the registry. For example, for HeartBeat implement, the timeout is the interval of two heart beats. | Above 2.1.0   |
| file      | registry.file               | string  | False       |               | Service governance        | The local file to cache the address list of registries and providers. When application restarts, it will restore the registries and providers. Please use different file for different registy. | Above 2.0.0   |
| check     | check                       | boolean | False       | true          | Service governance        | Whether throwing exception while the registry isn't existed. | Above 2.0.0   |
| register  | register                    | boolean | False       | true          | Service governance        | whether registering to the registry center. If false, just subscribing, not registering. | Above 2.0.5   |
| subscribe | subscribe                   | boolean | False       | true          | Service governance        | whether subscribing from the registry center. If false, just registering, not subscribing. | Above 2.0.5   |
| dynamic   | dynamic                     | boolean | False       | true          | Service governance        | Whether the service is registered dynamically. If false, services will be showed as `disable`, you need to enable it manually. And you also need to disable it when provider shut down. | Above 2.0.5   |
