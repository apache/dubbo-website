import React from 'react';

export default {
  'en-us': {
    barText: 'Community',
    events: {
      title: 'Events & News',
      list: [
        {
          img: '/img/blog/dubbo-shanghai-meetup.jpeg',
          title: 'Dubbo Shanghai meetup has been held successfully',
          content: 'The Dubbo meetup has successfully been held in Shanghai, over 700 people submitted registration, and over 300 were present, more than 10,000 watched the live online.',
          dateStr: 'June 23rd，2018',
          link: '/en-us/blog/dubbo-meetup-shanghai-jun-23rd-2018.html',
        },
        {
          img: '/img/blog/dubbo-beijing-meetup.png',
          title: 'The first Dubbo meetup has successfully been held in Beijing',
          content: 'The first Dubbo meetup has successfully been held in Beijing, over 400+ people were present. What a great event!',
          dateStr: 'May 12nd，2018',
          link: '/en-us/blog/dubbo-meetup-beijing-may-12th-2018.html',
        },
        {
          img: '/img/blog/apachecon-na-2018.png',
          title: 'The ApacheCon NA schedule has been announced',
          content: 'Ian Luo/Jun Liu will talk about "Introducing Apache Dubbo(Incubating): What is Dubbo and How it Works" at ApacheCon NA this year in Montréal!',
          dateStr: 'May 2nd，2018',
          link: '/en-us/blog/apachecon-na-2018.html',
        },
        {
          img: '/img/blog/qcon-beijing-2018.jpeg',
          title: 'Dubbo roadmap is announced in QCon Beijing 2018',
          content: 'Ian Luo has delivered a great talk at QCon Beijing 2018, where the roadmap of Dubbo has also be announced.',
          dateStr: 'April 21st，2018',
          link: '/en-us/blog/qcon-beijing-2018.html',
        },
      ]
    },
    contacts: {
      title: 'Talk To Us',
      desc: 'Feel free to contact us via the following channel.',
      list: [
        {
          img: '/img/mailinglist.png',
          imgHover: '/img/mailinglist_hover.png',
          title: 'Mailing List',
          link: 'https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide'
        },
        {
          img: '/img/alibaba.png',
          imgHover: '/img/alibaba_hover.png',
          title: '#alibaba/dubbo',
          link: 'https://gitter.im/alibaba/dubbo',
        },
        {
          img: '/img/segmentfault.png',
          imgHover: '/img/segmentfault_hover.png',
          title: 'Segment Fault',
          link: 'https://segmentfault.com/t/dubbo'
        },
        {
          img: '/img/twitter.png',
          imgHover: '/img/twitter_hover.png',
          title: '@ApacheDubbo',
          link: 'https://twitter.com/ApacheDubbo',
        },
      ],
    },
    contributorGuide: {
      title: 'Contributor Guide',
      desc: 'Want to contribute to Dubbo?',
      list: [
        {
          img: '/img/mailinglist.png',
          title: 'Mailing List',
          content: <span>Join the <a href="https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide">mailing list </a>and discussion your ideas with us.</span>,
        },
        {
          img: '/img/issue.png',
          title: 'Issue',
          content: <span>Reporting issues via <a href="https://github.com/apache/incubator-dubbo/issues">Github issues</a>.</span>,
        },
        {
          img: '/img/documents.png',
          title: 'Documents',
          content: <span>Improve the <a href="https://github.com/apache/incubator-dubbo-docs">documentation</a>.</span>,
        },
        {
          img: '/img/pullrequest.png',
          title: 'Pull Request',
          content: <span>Send your awesome enhancement via <a href="https://github.com/apache/incubator-dubbo/pulls">Pull requests.</a></span>,
        },
      ],
    },
    ecos: {
      title: 'Eco System',
      list: [
        {
            title: 'Bootstrap',
            content: <span>Generate Dubbo project with Spring Boot:</span>,
            tags: [
                {
                    text: 'Dubbo Initializr',
                    link: 'http://start.dubbo.io',
                    bgColor: '#7A63FC',
                },
            ],
        },
        {
          title: 'Language',
          content: <span>Dubbo supports the following languages:</span>,
          tags: [
            {
              text: 'Java',
              link: 'https://github.com/apache/incubator-dubbo',
              bgColor: '#7A63FC',
            },
            {
              text: 'Node.js',
              link: 'https://github.com/dubbo/dubbo2.js',
              bgColor: '#00D0D9',
            },
            {
              text: 'Python',
              link: 'https://github.com/dubbo/dubbo-client-py',
              bgColor: '#00D0D9',
            },
            {
              text: 'PHP',
              link: 'https://github.com/dubbo/dubbo-php-framework',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'API',
          content: <span>Dubbo supports the following API:</span>,
          tags: [
            {
              text: 'Spring XML',
              link: '/en-us/docs/user/configuration/xml.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Spring Annotation',
              link: '/en-us/docs/user/configuration/annotation.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Plain Java',
              link: '/en-us/docs/user/configuration/properties.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Spring Boot',
              link: 'https://github.com/apache/incubator-dubbo-spring-boot-project',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Registry',
          content: <span>Dubbo supports the following registries:</span>,
          tags: [
            {
              text: 'Zookeeper',
              link: '/en-us/docs/user/references/registry/zookeeper.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Redis',
              link: '/en-us/docs/user/references/registry/redis.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Simple',
              link: '/en-us/docs/user/references/registry/simple.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Multicast',
              link: '/en-us/docs/user/references/registry/multicast.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Etcd3',
              link: 'https://github.com/dubbo/dubbo-registry-etcd',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Cluster',
          content: <span>Dubbo supports the following clusters:</span>,
          tags: [
            {
              text: 'Fail over',
              link: '/en-us/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Fail safe',
              link: '/en-us/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail fast',
              link: '/en-us/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail back',
              link: '/en-us/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Forking',
              link: '/en-us/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Broadcast',
              link: '/en-us/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Load balance',
          content: <span>Dubbo supports the following load balance:</span>,
          tags: [
            {
              text: 'Random',
              link: '/en-us/docs/user/demos/loadbalance.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Least Active',
              link: '/en-us/docs/user/demos/loadbalance.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Round Robin',
              link: '/en-us/docs/user/demos/loadbalance.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Consistent hash',
              link: '/en-us/docs/user/demos/loadbalance.html',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Protocol',
          content: <span>Dubbo supports the following protocols:</span>,
          tags: [
            {
              text: 'Dubbo',
              link: '/en-us/docs/user/references/protocol/dubbo.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'RMI',
              link: '/en-us/docs/user/references/protocol/rmi.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Hessian',
              link: '/en-us/docs/user/references/protocol/hessian.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'HTTP',
              link: '/en-us/docs/user/references/protocol/http.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'WebService',
              link: '/en-us/docs/user/references/protocol/webservice.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Thrift',
              link: '/en-us/docs/user/references/protocol/thrift.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Native Thrift',
              link: 'https://github.com/dubbo/dubbo-rpc-native-thrift',
              bgColor: '#00D0D9',
            },
            {
              text: 'Memcached',
              link: '/en-us/docs/user/references/protocol/memcached.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Redis',
              link: '/en-us/docs/user/references/protocol/redis.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Rest',
              link: '/en-us/docs/user/references/protocol/rest.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'JsonRPC',
              link: 'https://github.com/apache/incubator-dubbo-rpc-jsonrpc',
              bgColor: '#00D0D9',
            },
            {
              text: 'XmlRPC',
              link: 'https://github.com/dubbo/incubator-dubbo-rpc-xmlrpc',
              bgColor: '#00D0D9',
            },
            {
              text: 'JmsRpc',
              link: 'https://github.com/dubbo/incubator-dubbo-rpc-jms',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Transport',
          content: <span>Dubbo supports the following transporters:</span>,
          tags: [
            {
              text: 'Netty3',
              link: '',
              bgColor: '#7A63FC',
            },
            {
              text: 'Netty4',
              link: '/en-us/docs/user/demos/netty4.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Grizzly',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Jetty',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Mina',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'P2P',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Zookeeper',
              link: '',
              bgColor: '#00D0D9',
            },
          ]
        },
        {
          title: 'Serialization',
          content: <span>Dubbo supports the following serialization:</span>,
          tags: [
            {
              text: 'Hessian2',
              link: '',
              bgColor: '#7A63FC',
            },
            {
              text: 'Java',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'JSON',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fst',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Kryo',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Native Hessian',
              link: 'https://github.com/dubbo/dubbo-serialization-native-hessian',
              bgColor: '#00D0D9',
            },
            {
              text: 'Avro',
              link: 'https://github.com/dubbo/dubbo-serialization-avro',
              bgColor: '#00D0D9',
            },
          ],
        },
      ],
    },
  },
  'zh-cn': {
    barText: '社区',
    events: {
      title: '事件 & 新闻',
      list: [
        {
          img: '/img/blog/dubbo-shanghai-meetup.jpeg',
          title: '第二届Dubbo开发者沙龙在上海成功举办',
          content: '第二届Dubbo开发者沙龙在上海成功举办，超过700位开发者报名，现场参与人数300+，通过阿里云天池、云栖社区、大咖说引导线上直播观看次数10000+',
          dateStr: 'Jun 23rd，2018',
          link: '/zh-cn/blog/dubbo-meetup-shanghai-jun-23rd-2018.html',
        },
        {
          img: '/img/blog/dubbo-beijing-meetup.png',
          title: '首届Dubbo开发者沙龙在北京成功举办',
          content: '首届Dubbo开发者沙龙在北京成功举办，超过400位开发者参加！',
          dateStr: 'May 12nd，2018',
          link: '/zh-cn/blog/dubbo-meetup-beijing-may-12th-2018.html',
        },
        {
          img: '/img/blog/apachecon-na-2018.png',
          title: 'ApacheCon大会议程公布',
          content: '罗毅/刘军 将进行题为"Introducing Apache Dubbo(Incubating): What is Dubbo and How it Works"的演讲。',
          dateStr: 'May 2nd，2018',
          link: '/zh-cn/blog/apachecon-na-2018.html',
        },
        {
          img: '/img/blog/qcon-beijing-2018.jpeg',
          title: 'Dubbo路线图在QCon Beijing 2018上公布',
          content: '罗毅在Qcon Beijing 2018上进行了Dubbo开源现状及未来规划的主题演讲。',
          dateStr: 'April 21st，2018',
          link: '/zh-cn/blog/qcon-beijing-2018.html',
        },
      ]
    },
    contacts: {
      title: '联系我们',
      desc: '有问题需要反馈？请通过一下方式联系我们。',
      list: [
        {
          img: '/img/mailinglist.png',
          imgHover: '/img/mailinglist_hover.png',
          title: '邮件列表',
          link: 'https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide'
        },
        {
          img: '/img/alibaba.png',
          imgHover: '/img/alibaba_hover.png',
          title: 'Gitter',
          link: 'https://gitter.im/alibaba/dubbo',
        },
        {
          img: '/img/segmentfault.png',
          imgHover: '/img/segmentfault_hover.png',
          title: 'Segment Fault',
          link: 'https://segmentfault.com/t/dubbo'
        },
        {
          img: '/img/twitter.png',
          imgHover: '/img/twitter_hover.png',
          title: '@ApacheDubbo',
          link: 'https://twitter.com/ApacheDubbo',
        },
      ],
    },
    contributorGuide: {
      title: '贡献指南',
      desc: 'Dubbo社区欢迎任何形式的贡献。',
      list: [
        {
          img: '/img/mailinglist.png',
          title: '邮件列表',
          content: <span>加入 <a href="https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide">邮件列表 </a>参与讨论。</span>,
        },
        {
          img: '/img/issue.png',
          title: '报告缺陷',
          content: <span>通过<a href="https://github.com/apache/incubator-dubbo/issues"> Github issues </a>报告缺陷。</span>,
        },
        {
          img: '/img/documents.png',
          title: '文档',
          content: <span>优化Dubbo <a href="http://dubbo.apache.org/#/docs/"> 文档</a>。</span>,
        },
        {
          img: '/img/pullrequest.png',
          title: 'Pull Request',
          content: <span>提交 <a href="https://github.com/apache/incubator-dubbo/pulls"> Pull requests </a>来修复问题。</span>,
        },
      ],
    },
    ecos: {
      title: '生态系统',
      list: [
        {
          title: '脚手架',
          content: <span>快速生成基于 Spring Boot 的 Dubbo 项目:</span>,
          tags: [
            {
                text: 'Dubbo Initializr',
                link: 'http://start.dubbo.io',
                bgColor: '#7A63FC',
            },
          ],
        },
        {
          title: '多语言',
          content: <span>Dubbo支持以下语言:</span>,
          tags: [
            {
              text: 'Java',
              link: 'https://github.com/apache/incubator-dubbo',
              bgColor: '#7A63FC',
            },
            {
              text: 'Node.js',
              link: 'https://github.com/dubbo/dubbo2.js',
              bgColor: '#00D0D9',
            },
            {
              text: 'Python',
              link: 'https://github.com/dubbo/dubbo-client-py',
              bgColor: '#00D0D9',
            },
            {
              text: 'PHP',
              link: 'https://github.com/dubbo/dubbo-php-framework',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'API',
          content: <span>Dubbo支持通过多种API方式启动:</span>,
          tags: [
            {
              text: 'Spring XML',
              link: '/zh-cn/docs/user/configuration/xml.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Spring Annotation',
              link: '/zh-cn/docs/user/configuration/annotation.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Plain Java',
              link: '/zh-cn/docs/user/configuration/properties.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Spring Boot',
              link: 'https://github.com/apache/incubator-dubbo-spring-boot-project',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Registry',
          content: <span>Dubbo支持以下注册中心:</span>,
          tags: [
            {
              text: 'Zookeeper',
              link: '/zh-cn/docs/user/references/registry/zookeeper.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Redis',
              link: '/zh-cn/docs/user/references/registry/redis.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Simple',
              link: '/zh-cn/docs/user/references/registry/simple.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Multicast',
              link: '/zh-cn/docs/user/references/registry/multicast.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Etcd3',
              link: 'https://github.com/dubbo/dubbo-registry-etcd',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Cluster',
          content: <span>Dubbo支持一下容错机制:</span>,
          tags: [
            {
              text: 'Fail over',
              link: '/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Fail safe',
              link: '/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail fast',
              link: '/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail back',
              link: '/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Forking',
              link: '/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Broadcast',
              link: '/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Load balance',
          content: <span>Dubbo支持以下负载均衡策略:</span>,
          tags: [
            {
              text: 'Random',
              link: '/zh-cn/docs/user/demos/loadbalance.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'Least Active',
              link: '/zh-cn/docs/user/demos/loadbalance.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Round Robin',
              link: '/zh-cn/docs/user/demos/loadbalance.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Consistent hash',
              link: '/zh-cn/docs/user/demos/loadbalance.html',
              bgColor: '#00D0D9',
            },
          ],
        },
        {
          title: 'Protocol',
          content: <span>Dubbo支持以下协议:</span>,
          tags: [
            {
              text: 'Dubbo',
              link: '/zh-cn/docs/user/references/protocol/dubbo.html',
              bgColor: '#7A63FC',
            },
            {
              text: 'RMI',
              link: '/zh-cn/docs/user/references/protocol/rmi.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Hessian',
              link: '/zh-cn/docs/user/references/protocol/hessian.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'HTTP',
              link: '/zh-cn/docs/user/references/protocol/http.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'WebService',
              link: '/zh-cn/docs/user/references/protocol/webservice.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Thrift',
              link: '/zh-cn/docs/user/references/protocol/thrift.html',
              bgColor: '#00D0D9',
            },
            {
                text: 'Native Thrift',
                link: 'https://github.com/dubbo/dubbo-rpc-native-thrift',
                bgColor: '#00D0D9',
            },
            {
              text: 'Memcached',
              link: '/zh-cn/docs/user/references/protocol/memcached.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Redis',
              link: '/zh-cn/docs/user/references/protocol/redis.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Rest',
              link: '/zh-cn/docs/user/references/protocol/rest.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'JsonRPC',
              link: 'https://github.com/apache/incubator-dubbo-rpc-jsonrpc',
              bgColor: '#00D0D9',
            },
            {
              text: 'XmlRPC',
              link: 'https://github.com/dubbo/incubator-dubbo-rpc-xmlrpc',
              bgColor: '#00D0D9',
            },
            {
                text: 'JmsRpc',
                link: 'https://github.com/dubbo/incubator-dubbo-rpc-jms',
                bgColor: '#00D0D9',
            },
          ]
        },
        {
          title: 'Transport',
          content: <span>Dubbo支持以下网络传输扩展:</span>,
          tags: [
            {
              text: 'Netty3',
              link: '',
              bgColor: '#7A63FC',
            },
            {
              text: 'Netty4',
              link: '/zh-cn/docs/user/demos/netty4.html',
              bgColor: '#00D0D9',
            },
            {
              text: 'Grizzly',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Jetty',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Mina',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'P2P',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Zookeeper',
              link: '',
              bgColor: '#00D0D9',
            },
          ]
        },
        {
          title: 'Serialization',
          content: <span>Dubbo支持以下序列化机制:</span>,
          tags: [
            {
              text: 'Hessian2',
              link: '',
              bgColor: '#7A63FC',
            },
            {
              text: 'Java',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'JSON',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fst',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Kryo',
              link: '',
              bgColor: '#00D0D9',
            },
            {
              text: 'Native Hessian',
              link: 'https://github.com/dubbo/dubbo-serialization-native-hessian',
              bgColor: '#00D0D9',
            },
            {
              text: 'Avro',
              link: 'https://github.com/dubbo/dubbo-serialization-avro',
              bgColor: '#00D0D9',
            },
          ],
        },
      ],
    },
  },
};
