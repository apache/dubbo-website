> ![check](sources/images/check.gif)推荐使用Zookeeper注册中心

* 你可以只运行`Demo Provider`和`Demo Consumer`，它们缺省配置为通过Multicast注册中心广播互相发现，建议在不同机器上运行，如果在同一机器上，需设置`unicast=false`：即：`multicast://224.5.6.7:1234?unicast=false`，否则发给消费者的单播消息可能被提供者抢占，两个消费者在同一台机器也一样，只有multicast注册中心有此问题。
* 你也可以运行多个`Demo Provider`和`Demo Consumer`，来验证软负载均衡，Demo Consumer可以直接启动多个实例，而多个Demo Provider因有端口冲突，可在不同机器上运行，或者修改Demo Provider安装目录下conf/dubbo.properties配置中的dubbo.protocol.port的值。
* 你也可以增加运行`Simple Monitor`监控中心，它缺省配置为通过Multicast注册中心广播发现Provider和Consumer，并展示出它们的依赖关系，以及它们之间调用的次数和时间。
* 你也可以将Multicast注册中心换成Zookeeper注册中心，安装`Zookeeper Registry`后，修改Demo Proivder，Demo Consumer，Simple Monitor三者安装目录下的conf/dubbo.properties，将dubbo.registry.address的值改为`zookeeper://127.0.0.1:2181`，同理，如果换成`Redis Registry`，值改为`redis://127.0.0.1:6379`，如果换成`Simple Registry`，值改为`dubbo://127.0.0.1:9090`

	**注意：multicast地址不能配成127.0.0.1，也不能配成机器的IP地址，必须是D段广播地址，也就是：224.0.0.0到239.255.255.255之间的任意地址**