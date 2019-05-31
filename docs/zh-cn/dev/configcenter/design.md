Namespace：通常用于多租户隔离

Group: 配置集合的分组，通常用于同租户内不同用途的配置间的隔离

Key: 配置项ID



|           | example                                                      | Namespace            | Group                            | Key                                                          |
| --------- | ------------------------------------------------------------ | -------------------- | -------------------------------- | ------------------------------------------------------------ |
| Zookeeper | /dubbo/config/dubbo/org.apache.dubbo.DemoService/configurators<br />/dubbo/config/dubbo/demo-application-name/configurators | 根节点，默认值/dubbo | /dubbo/config/dubbo，默认值dubbo | 服务名/应用名 + 规则分类：<br />org.apache.dubbo.DemoService/configurators<br />demo-application-name/configurators |
| Etcd      |                                                              |                      |                                  |                                                              |
| Consul    |                                                              |                      |                                  |                                                              |
| Nacos     |                                                              |                      |                                  |                                                              |
| Apollo    |                                                              |                      |                                  |                                                              |
| Redis     |                                                              |                      |                                  |                                                              |

