# Install manual

You can run Demo Provider and Demo Consumer only, the default discovery strategy is Multicast by configuration center broadcast, do not run the two parts on the same machine, if you have to do so, set `unicast=false`, like `multicast://224.5.6.7:1234?unicast=false`, or the unicast send to consumer will be taken by provider, and the same for consumers. Only multicast has this issue

You can run multiple Demo Provider and Demo consumer to verify load balance. Demo Consumer can run multi instance directly. Because of port conflict, you can either run multi Demo Providers on different machines or modify the value of `dubbo.protocol.port` in `conf/dubbo.properties` under the install directory of `conf/dubbo.properties`

You can add Simple Monitor as a monitor center, the default discovery strategy is Multicast by configuration center broadcast, display the dependency relationship, call times and cost

You can use Zookeeper instead of Multicast as the configuration center, after Zookeeper Registry installation, modify `conf/dubbo.properties` under the installation directory of Demo Provider, Demo Consumer and Simple Monitor, change the value of `dubbo.registry.address` to `zookeeper://127.0.0.1:2181`(`redis://127.0.0.1:6379` for Redis Registry). the value for Simple Registry is `dubbo://127.0.0.1:9090`

Zookeeper configuration address is recommended

[^1]: NOTICE: multicast can be neither 127.0.0.1 nor the machine's IP address, it must be a type D broadcast address, from 224.0.0.0 to 239.255.255.255
