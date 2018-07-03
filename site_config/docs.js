export default {
  'en-us': {
    sidemenu: [
      {
        title: 'User doc',
        children: [
          {
            title: 'Preface',
            children: [
              {
                title: 'Background',
                link: '/docs/user/preface/background.md',
              },
              {
                title: 'Requirements',
                link: '/docs/user/preface/requirements.md',
              },
              {
                title: 'Architecture',
                link: '/docs/user/preface/architecture.md'
              },
              {
                title: 'Usage',
                link: '/docs/user/preface/usage.md'
              }
            ],
          },
          {
            title: 'Quick start',
            link: '/docs/user/quick-start.md'
          },
          {
            title: 'Dependencies',
            link: '/docs/user/dependencies.md'
          },
          {
            title: 'Maturality',
            link: '/docs/user/maturity.md'
          },
          {
            title: 'Configuration',
            children: [
              {
                title: 'XML configuration',
                link: '/docs/user/configuration/xml.md',
              },
              {
                title: 'Properties configuration',
                link: '/docs/user/configuration/properties.md',
              },
              {
                title: 'API configuration',
                link: '/docs/user/configuration/api.md'
              },
              {
                title: 'Annotation configuration',
                link: '/docs/user/configuration/annotation.md'
              }
            ],
          },
          {
            title: 'Demos',
            children: [
              {
                title: 'Start check',
                link: '/docs/user/demos/preflight-check.md',
              },
              {
                title: 'Fault-tolerent strategy',
                link: '/docs/user/demos/fault-tolerent-strategy.md',
              },
              {
                title: 'Load balance',
                link: '/docs/user/demos/loadbalance.md'
              },
              {
                title: 'Thread model',
                link: '/docs/user/demos/thread-model.md'
              },
              {
                title: 'Connecting certain provider straightly',
                link: '/docs/user/demos/explicit-target.md',
              },
              {
                title: 'Subscribe only',
                link: '/docs/user/demos/subscribe-only.md',
              },
              {
                title: 'Registry only',
                link: '/docs/user/demos/registry-only.md'
              },
              {
                title: 'Static service',
                link: '/docs/user/demos/static-service.md'
              },
              {
                title: 'Multi-protocols',
                link: '/docs/user/demos/multi-protocols.md',
              },
              {
                title: 'Multi-registries',
                link: '/docs/user/demos/multi-registry.md',
              },
              {
                title: 'Service group',
                link: '/docs/user/demos/service-group.md'
              },
              {
                title: 'Multi-versions',
                link: '/docs/user/demos/multi-versions.md'
              },
              {
                title: 'Group merger',
                link: '/docs/user/demos/group-merger.md',
              },
              {
                title: 'Parameter validation',
                link: '/docs/user/demos/parameter-validation.md',
              },
              {
                title: 'Result cache',
                link: '/docs/user/demos/result-cache.md'
              },
              {
                title: 'Generic reference',
                link: '/docs/user/demos/generic-reference.md'
              },
              {
                title: 'Generic service',
                link: '/docs/user/demos/generic-service.md',
              },
              {
                title: 'Echo service',
                link: '/docs/user/demos/echo-service.md',
              },
              {
                title: 'Context',
                link: '/docs/user/demos/context.md'
              },
              {
                title: 'Attachment',
                link: '/docs/user/demos/attachment.md'
              },
              {
                title: 'Asynchronous call',
                link: '/docs/user/demos/async-call.md',
              },
              {
                title: 'Local call',
                link: '/docs/user/demos/local-call.md',
              },
              {
                title: 'Callback parameter',
                link: '/docs/user/demos/callback-parameter.md'
              },
              {
                title: 'Events notify',
                link: '/docs/user/demos/events-notify.md'
              },
              {
                title: 'Local stub',
                link: '/docs/user/demos/local-stub.md',
              },
              {
                title: 'Local mock',
                link: '/docs/user/demos/local-mock.md',
              },
              {
                title: 'Delay publish',
                link: '/docs/user/demos/delay-publish.md'
              },
              {
                title: 'Concurrency control',
                link: '/docs/user/demos/concurrency-control.md'
              },
              {
                title: 'Connections limitation',
                link: '/docs/user/demos/config-connections.md',
              },
              {
                title: 'Lazy connect',
                link: '/docs/user/demos/lazy-connect.md',
              },
              {
                title: 'Stickness connections',
                link: '/docs/user/demos/stickiness.md'
              },
              {
                title: 'Token authorization',
                link: '/docs/user/demos/token-authorization.md'
              },
              {
                title: 'Routing rule',
                link: '/docs/user/demos/routing-rule.md',
              },
              {
                title: 'Configuration rule',
                link: '/docs/user/demos/config-rule.md',
              },
              {
                title: 'Service downgrade',
                link: '/docs/user/demos/service-downgrade.md'
              },
              {
                title: 'Graceful shutdown',
                link: '/docs/user/demos/graceful-shutdown.md'
              },
              {
                title: 'Hostname binding',
                link: '/docs/user/demos/hostname-binding.md',
              },
              {
                title: 'Logger strategy',
                link: '/docs/user/demos/logger-strategy.md',
              },
              {
                title: 'Accesslog',
                link: '/docs/user/demos/accesslog.md'
              },
              {
                title: 'Service container',
                link: '/docs/user/demos/service-container.md'
              },
              {
                title: 'Reference config cache',
                link: '/docs/user/demos/reference-config-cache.md',
              },
              {
                title: 'Distributed transaction',
                link: '/docs/user/demos/distributed-transaction.md',
              },
              {
                title: 'Automatic thread dump',
                link: '/docs/user/demos/dump.md'
              },
              {
                title: 'Netty4',
                link: '/docs/user/demos/netty4.md'
              },
            ],
          },
          {
            title: 'API configuration reference',
            link: '/docs/user/references/api.md'
          },
          {
            title: 'Schema configuration reference',
            children: [
              {
                title: 'Introduction',
                link: '/docs/user/references/xml/introduction.md',
              },
              {
                title: 'dubbo:service',
                link: '/docs/user/references/xml/dubbo-service.md',
              },
              {
                title: 'dubbo:reference',
                link: '/docs/user/references/xml/dubbo-reference.md',
              },
              {
                title: 'dubbo:protocol',
                link: '/docs/user/references/xml/dubbo-protocol.md',
              },
              {
                title: 'dubbo:registry',
                link: '/docs/user/references/xml/dubbo-registry.md',
              },
              {
                title: 'dubbo:monitor',
                link: '/docs/user/references/xml/dubbo-monitor.md',
              },
              {
                title: 'dubbo:application',
                link: '/docs/user/references/xml/dubbo-application.md',
              },
              {
                title: 'dubbo:module',
                link: '/docs/user/references/xml/dubbo-module.md',
              },
              {
                title: 'dubbo:provider',
                link: '/docs/user/references/xml/dubbo-provider.md',
              },
              {
                title: 'dubbo:consumer',
                link: '/docs/user/references/xml/dubbo-consumer.md',
              },
              {
                title: 'dubbo:method',
                link: '/docs/user/references/xml/dubbo-method.md',
              },
              {
                title: 'dubbo:argument',
                link: '/docs/user/references/xml/dubbo-argument.md',
              },
              {
                title: 'dubbo:parameter',
                link: '/docs/user/references/xml/dubbo-parameter.md',
              },
            ]
          },
          {
            title: 'Protocol configuration reference',
            children: [
              {
                title: 'Introduction',
                link: '/docs/user/references/protocol/introduction.md',
              },
              {
                title: 'dubbo://',
                link: '/docs/user/references/protocol/dubbo.md',
              },
              {
                title: 'rmi://',
                link: '/docs/user/references/protocol/rmi.md',
              },
              {
                title: 'hessian://',
                link: '/docs/user/references/protocol/hessian.md',
              },
              {
                title: 'http://',
                link: '/docs/user/references/protocol/http.md',
              },
              {
                title: 'webservice://',
                link: '/docs/user/references/protocol/webservice.md',
              },
              {
                title: 'thrift://',
                link: '/docs/user/references/protocol/thrift.md',
              },
              {
                title: 'memcached://',
                link: '/docs/user/references/protocol/memcached.md',
              },
              {
                title: 'redis://',
                link: '/docs/user/references/protocol/redis.md',
              },
              {
                title: 'rest://',
                link: '/docs/user/references/protocol/rest.md',
              },
            ]
          },
          {
            title: 'Registry configuration reference',
            children: [
              {
                title: 'Introduction',
                link: '/docs/user/references/registry/introduction.md',
              },
              {
                title: 'Multicast registry',
                link: '/docs/user/references/registry/multicast.md',
              },
              {
                title: 'Zookeeper registry',
                link: '/docs/user/references/registry/zookeeper.md',
              },
              {
                title: 'Redis registry',
                link: '/docs/user/references/registry/redis.md',
              },
              {
                title: 'Simple registry',
                link: '/docs/user/references/registry/simple.md',
              },
            ]
          },
          {
            title: 'Telnet command',
            link: '/docs/user/references/telnet.md'
          },
          {
            title: 'Maven plugin',
            link: '/docs/user/references/maven.md'
          },
          {
            title: 'Best practice',
            link: '/docs/user/best-practice.md'
          },
          {
            title: 'Recommended usage',
            link: '/docs/user/recommend.md'
          },
          {
            title: 'Capacity plan',
            link: '/docs/user/capacity-plan.md'
          },
          {
            title: 'Performance testing reports',
            link: '/docs/user/perf-test.md'
          },
          {
            title: 'Test coverage report',
            link: '/docs/user/coveragence.md'
          }
        ],
      },
    ],
    barText: 'Documentation',
  },
  'zh-cn': {
    sidemenu: [
      {
        title: '用户文档',
        children: [
          {
            title: '入门',
            children: [
              {
                title: '背景',
                link: '/docs/user/preface/background.md',
              },
              {
                title: '需求',
                link: '/docs/user/preface/requirements.md',
              },
              {
                title: '架构',
                link: '/docs/user/preface/architecture.md'
              },
              {
                title: '用法',
                link: '/docs/user/preface/usage.md'
              }
            ],
          },
          {
            title: '快速启动',
            link: '/docs/user/quick-start.md'
          },
          {
            title: '依赖',
            link: '/docs/user/dependencies.md'
          },
          {
            title: '成熟度',
            link: '/docs/user/maturity.md'
          },
          {
            title: '配置',
            children: [
              {
                title: 'XML配置',
                link: '/docs/user/configuration/xml.md',
              },
              {
                title: '属性配置',
                link: '/docs/user/configuration/properties.md',
              },
              {
                title: 'API配置',
                link: '/docs/user/configuration/api.md'
              },
              {
                title: '注解配置',
                link: '/docs/user/configuration/annotation.md'
              }
            ],
          },
          {
            title: '示例',
            children: [
              {
                title: '启动时检查',
                link: '/docs/user/demos/preflight-check.md',
              },
              {
                title: '集群容错',
                link: '/docs/user/demos/fault-tolerent-strategy.md',
              },
              {
                title: '负载均衡',
                link: '/docs/user/demos/loadbalance.md'
              },
              {
                title: '线程模型',
                link: '/docs/user/demos/thread-model.md'
              },
              {
                title: '直连提供者',
                link: '/docs/user/demos/explicit-target.md',
              },
              {
                title: '只订阅',
                link: '/docs/user/demos/subscribe-only.md',
              },
              {
                title: '只注册',
                link: '/docs/user/demos/registry-only.md'
              },
              {
                title: '静态服务',
                link: '/docs/user/demos/static-service.md'
              },
              {
                title: '多协议',
                link: '/docs/user/demos/multi-protocols.md',
              },
              {
                title: '多注册中心',
                link: '/docs/user/demos/multi-registry.md',
              },
              {
                title: '服务分组',
                link: '/docs/user/demos/service-group.md'
              },
              {
                title: '多版本',
                link: '/docs/user/demos/multi-versions.md'
              },
              {
                title: '分组聚合',
                link: '/docs/user/demos/group-merger.md',
              },
              {
                title: '参数验证',
                link: '/docs/user/demos/parameter-validation.md',
              },
              {
                title: '结果缓存',
                link: '/docs/user/demos/result-cache.md'
              },
              {
                title: '泛化引用',
                link: '/docs/user/demos/generic-reference.md'
              },
              {
                title: '泛化实现',
                link: '/docs/user/demos/generic-service.md',
              },
              {
                title: '回声测试',
                link: '/docs/user/demos/echo-service.md',
              },
              {
                title: '上下文信息',
                link: '/docs/user/demos/context.md'
              },
              {
                title: '隐式参数',
                link: '/docs/user/demos/attachment.md'
              },
              {
                title: '异步调用',
                link: '/docs/user/demos/async-call.md',
              },
              {
                title: '本地调用',
                link: '/docs/user/demos/local-call.md',
              },
              {
                title: '参数回调',
                link: '/docs/user/demos/callback-parameter.md'
              },
              {
                title: '事件通知',
                link: '/docs/user/demos/events-notify.md'
              },
              {
                title: '本地存根',
                link: '/docs/user/demos/local-stub.md',
              },
              {
                title: '本地伪装',
                link: '/docs/user/demos/local-mock.md',
              },
              {
                title: '延迟暴露',
                link: '/docs/user/demos/delay-publish.md'
              },
              {
                title: '并发控制',
                link: '/docs/user/demos/concurrency-control.md'
              },
              {
                title: '连接控制',
                link: '/docs/user/demos/config-connections.md',
              },
              {
                title: '延迟连接',
                link: '/docs/user/demos/lazy-connect.md',
              },
              {
                title: '粘滞连接',
                link: '/docs/user/demos/stickiness.md'
              },
              {
                title: '令牌验证',
                link: '/docs/user/demos/token-authorization.md'
              },
              {
                title: '路由规则',
                link: '/docs/user/demos/routing-rule.md',
              },
              {
                title: '配置规则',
                link: '/docs/user/demos/config-rule.md',
              },
              {
                title: '服务降级',
                link: '/docs/user/demos/service-downgrade.md'
              },
              {
                title: '优雅停机',
                link: '/docs/user/demos/graceful-shutdown.md'
              },
              {
                title: '主机绑定',
                link: '/docs/user/demos/hostname-binding.md',
              },
              {
                title: '日志适配',
                link: '/docs/user/demos/logger-strategy.md',
              },
              {
                title: '访问日志',
                link: '/docs/user/demos/accesslog.md'
              },
              {
                title: '服务容器',
                link: '/docs/user/demos/service-container.md'
              },
              {
                title: 'Reference Config 缓存',
                link: '/docs/user/demos/reference-config-cache.md',
              },
              {
                title: '分布式事务',
                link: '/docs/user/demos/distributed-transaction.md',
              },
              {
                title: '线程栈自动dump',
                link: '/docs/user/demos/dump.md'
              },
              {
                title: 'Netty4',
                link: '/docs/user/demos/netty4.md'
              },
              {
                title: 'Kryo和FST序列化',
                link: '/docs/user/demos/serialization.md',
              },
            ],
          },
          {
            title: 'API配置参考手册',
            link: '/docs/user/references/api.md'
          },
          {
            title: 'schema配置参考手册',
            children: [
              {
                title: '介绍',
                link: '/docs/user/references/xml/introduction.md',
              },
              {
                title: 'dubbo:service',
                link: '/docs/user/references/xml/dubbo-service.md',
              },
              {
                title: 'dubbo:reference',
                link: '/docs/user/references/xml/dubbo-reference.md',
              },
              {
                title: 'dubbo:protocol',
                link: '/docs/user/references/xml/dubbo-protocol.md',
              },
              {
                title: 'dubbo:registry',
                link: '/docs/user/references/xml/dubbo-registry.md',
              },
              {
                title: 'dubbo:monitor',
                link: '/docs/user/references/xml/dubbo-monitor.md',
              },
              {
                title: 'dubbo:application',
                link: '/docs/user/references/xml/dubbo-application.md',
              },
              {
                title: 'dubbo:module',
                link: '/docs/user/references/xml/dubbo-module.md',
              },
              {
                title: 'dubbo:provider',
                link: '/docs/user/references/xml/dubbo-provider.md',
              },
              {
                title: 'dubbo:consumer',
                link: '/docs/user/references/xml/dubbo-consumer.md',
              },
              {
                title: 'dubbo:method',
                link: '/docs/user/references/xml/dubbo-method.md',
              },
              {
                title: 'dubbo:argument',
                link: '/docs/user/references/xml/dubbo-argument.md',
              },
              {
                title: 'dubbo:parameter',
                link: '/docs/user/references/xml/dubbo-parameter.md',
              },
            ]
          },
          {
            title: '协议参考手册',
            children: [
              {
                title: '介绍',
                link: '/docs/user/references/protocol/introduction.md',
              },
              {
                title: 'dubbo://',
                link: '/docs/user/references/protocol/dubbo.md',
              },
              {
                title: 'rmi://',
                link: '/docs/user/references/protocol/rmi.md',
              },
              {
                title: 'hessian://',
                link: '/docs/user/references/protocol/hessian.md',
              },
              {
                title: 'http://',
                link: '/docs/user/references/protocol/http.md',
              },
              {
                title: 'webservice://',
                link: '/docs/user/references/protocol/webservice.md',
              },
              {
                title: 'thrift://',
                link: '/docs/user/references/protocol/thrift.md',
              },
              {
                title: 'memcached://',
                link: '/docs/user/references/protocol/memcached.md',
              },
              {
                title: 'redis://',
                link: '/docs/user/references/protocol/redis.md',
              },
              {
                title: 'rest://',
                link: '/docs/user/references/protocol/rest.md',
              },
            ]
          },
          {
            title: '注册中心参考手册',
            children: [
              {
                title: '介绍',
                link: '/docs/user/references/registry/introduction.md',
              },
              {
                title: 'Multicast 注册中心',
                link: '/docs/user/references/registry/multicast.md',
              },
              {
                title: 'Zookeeper 注册中心',
                link: '/docs/user/references/registry/zookeeper.md',
              },
              {
                title: 'Redis 注册中心',
                link: '/docs/user/references/registry/redis.md',
              },
              {
                title: 'Simple 注册中心',
                link: '/docs/user/references/registry/simple.md',
              },
            ]
          },
          {
            title: 'telnet命令参考手册',
            link: '/docs/user/references/telnet.md'
          },
          {
            title: '在线运维命令-QOS',
            link: '/docs/user/references/qos.md'
          },
          {
            title: 'maven插件参考手册',
            link: '/docs/user/references/maven.md'
          },
          {
            title: '服务化最佳实践',
            link: '/docs/user/best-practice.md'
          },
          {
            title: '推荐用法',
            link: '/docs/user/recommend.md'
          },
          {
            title: '容量规划',
            link: '/docs/user/capacity-plan.md'
          },
          {
            title: '性能测试报告',
            link: '/docs/user/perf-test.md'
          },
          {
            title: '测试覆盖率报告',
            link: '/docs/user/coveragence.md'
          }
        ],
      },
    ],
    barText: '文档',
  }
};
