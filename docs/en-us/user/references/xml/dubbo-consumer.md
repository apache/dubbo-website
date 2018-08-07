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
# dubbo:consumer

Consumer default configuration. The corresponding clas： `com.alibaba.dubbo.config.ConsumerConfig`. It is also default configuration of `<dubbo:reference>`.

| Property | Corresponding URL parameter | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| timeout | default.timeout | int | N | 1000 | performance optimization | invoking timeout(ms) | above 1.0.16 |
| retries | default.retries | int | N | 2 | performance optimization | Invoking retry times, exclude the first invoking. Set 0 to disable it | above 1.0.16 |
| loadbalance | default.loadbalance | string | N | random | performance optimization | Load balancing strategy. Choices：random, roundrobin(polling), leastactive(invoking least active service) | above 1.0.16 |
| async | default.async | boolean | N | false | performance optimization | Whether invoke asynchronously | above 2.0.0 |
| connections | default.connections | int | N | 100 | performance optimization | The maximum number of connections of per service provider. Only short link protocol such as rmi,http,hessian etc. supports. Long link protocol such as dubbo doesn't support | above 1.0.16 |
| generic | generic | boolean | N | false | service governance | Whether default generic interface. A instance of GenericService will be got if true. | above 2.0.0 |
| check | check | boolean | N | true | service governance | Whether check the survival of provider. If true, throw exception when no provider of some services is alive. Otherwise, just ignore it| above 1.0.16 |
| proxy | proxy | string | N | javassist | performance optimization | Java class compile.It is used for the generating of dynamic class. The options are JDK and javassist | above 2.0.5 |
| owner | owner | string | N | | service governance | Application manager. Pls. fill in the mailbox prefix of the person in charge | above 2.0.5 |
| actives | default.actives | int | N | 0 | performance optimization | The max concurrency of per service method for each corresponding consumer | above 2.0.5 |
| cluster | default.cluster | string | N | failover | performance optimization | Cluster tolerance. Choices：failover/failfast/failsafe/failback/forking | above 2.0.5 |
| filter | reference.filter | string | N |   | performance optimization | The name of filter which intercepts consumer remote invoke. Multiple names are separated by commas | above 2.0.5 |
| listener | invoker.listener | string | N | | performance optimization | The consumer referenced service listener name. Multiple names are separated by commas | above 2.0.5 |
| registry | | string | N | register with the registry | configuration relevant | Register with the designated registry. Generally，for multiple registries, and value is the "id" of &lt;dubbo:registry&gt;. Multiple registries are separated by commas.If you do not want to register the service to any registry，pls set "N/A" | above 2.0.5 |
| layer | layer | string | N | | service governance | The layer of consumer. Such as: biz, dao, intl:web, china:acton | above 2.0.7 |
| init | init | boolean | N | false | performance optimization | If true, initialize when "afterPropertiesSet()" is invoked. Otherwise wait until the instance is referenced to initialize  | above 2.0.10 |
| cache | cache | string/boolean | N | | service governance | Cache return result, and key is call parameters. Choices: lru, threadlocal, jcache and so on | at least 2.1.0 |
| validation | validation | boolean | N | | service governance | Whether enable JSR303 standard annotation validation| at least 2.1.0 |