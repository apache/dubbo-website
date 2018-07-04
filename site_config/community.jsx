import React from 'react';

export default {
  'en-us': {
    barText: 'Community',
    events: {
      title: 'Events & News',
      list: [
        {
          img: './img/blog/dubbo-beijing-meetup.png',
          title: 'The first Dubbo meetup has successfully been held in Beijing',
          content: 'The first Dubbo meetup has successfully been held in Beijing, over 400+ people were present. What a great event!',
          dateStr: 'May 12nd，2018',
          link: '/blog/dubbo-meetup-beijing-may-12th-2018.md',
        },
        {
          img: './img/blog/apachecon-na-2018.png',
          title: 'The ApacheCon NA schedule has been announced',
          content: 'Ian Luo/Jun Liu will talk about "Introducing Apache Dubbo(Incubating): What is Dubbo and How it Works" at ApacheCon NA this year in Montréal!',
          dateStr: 'May 2nd，2018',
          link: '/blog/apachecon-na-2018.md',
        },
        {
          img: './img/blog/qcon-beijing-2018.jpeg',
          title: 'Dubbo roadmap is announced in QCon Beijing 2018',
          content: 'Ian Luo has delivered a great talk at QCon Beijing 2018, where the roadmap of Dubbo has also be announced.',
          dateStr: 'April 21st，2018',
          link: '/blog/qcon-beijing-2018.md',
        },
      ]
    },
    contacts: {
      title: 'Talk To Us',
      desc: 'Feel free to contact us via the following channel.',
      list: [
        {
          img: './img/mailinglist.png',
          imgHover: './img/mailinglist_hover.png',
          title: 'Mailing List',
          link: 'https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide'
        },
        {
          img: './img/alibaba.png',
          imgHover: './img/alibaba_hover.png',
          title: '#alibaba/dubbo',
          link: 'https://gitter.im/alibaba/dubbo',
        },
        {
          img: './img/segmentfault.png',
          imgHover: './img/segmentfault_hover.png',
          title: 'Segment Fault',
          link: 'https://segmentfault.com/t/dubbo'
        },
        {
          img: './img/twitter.png',
          imgHover: './img/twitter_hover.png',
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
          img: './img/mailinglist.png',
          title: 'Mailing List',
          content: <span>Join the <a href="https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide">mailing list </a>and discussion your ideas with us.</span>,
        },
        {
          img: './img/issue.png',
          title: 'Issue',
          content: <span>Reporting issues via <a href="https://github.com/apache/incubator-dubbo/issues">Github issues</a>.</span>,
        },
        {
          img: './img/documents.png',
          title: 'Documents',
          content: <span>Improve the <a href="https://github.com/apache/incubator-dubbo-docs">documentation</a>.</span>,
        },
        {
          img: './img/pullrequest.png',
          title: 'Pull Request',
          content: <span>Send your awesome enhancement via <a href="https://github.com/apache/incubator-dubbo/pulls">Pull requests.</a></span>,
        },
      ],
    },
    ecos: {
      title: 'Eco System',
      list: [
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
          ],
        },
        {
          title: 'API',
          content: <span>Dubbo supports the following API:</span>,
          tags: [
            {
              text: 'Spring XML',
              link: '#/docs/configuration/xml.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Spring Annotation',
              link: '#/docs/configuration/annotation.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Plain Java',
              link: '#/docs/configuration/properties.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Spring-boot',
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
              link: '#/docs/references/registry/zookeeper.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Redis',
              link: '#/docs/references/registry/redis.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Simple',
              link: '#/docs/references/registry/simple.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Multicast',
              link: '#/docs/references/registry/multicast.md',
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
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Fail safe',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail fast',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail back',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Forking',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Broadcast',
              link: '#/docs/demos/fault-tolerent-strategy.md',
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
              link: '#/docs/demos/loadbalance.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Least Active',
              link: '#/docs/demos/loadbalance.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Round Robin',
              link: '#/docs/demos/loadbalance.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Consistent hash',
              link: '#/docs/demos/loadbalance.md',
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
              link: '#/docs/references/protocol/dubbo.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'RMI',
              link: '#/docs/references/protocol/rmi.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Hessian',
              link: '#/docs/references/protocol/hessian.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'HTTP',
              link: '#/docs/references/protocol/http.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'WebService',
              link: '#/docs/references/protocol/webservice.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Thrift',
              link: '#/docs/references/protocol/thrift.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Memcached',
              link: '#/docs/references/protocol/memcached.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Redis',
              link: '#/docs/references/protocol/redis.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Rest',
              link: '#/docs/references/protocol/rest.md',
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
          ]
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
              link: '#/docs/demos/netty4.md',
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
              text: 'p2p',
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
            }
          ]
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
          img: './img/blog/dubbo-beijing-meetup.png',
          title: '首届Dubbo开发者沙龙在北京成功举办',
          content: '首届Dubbo开发者沙龙在北京成功举办，超过400位开发者参加！',
          dateStr: 'May 12nd，2018',
          link: '/blog/dubbo-meetup-beijing-may-12th-2018.md',
        },
        {
          img: './img/blog/apachecon-na-2018.png',
          title: 'ApacheCon大会议程公布',
          content: '罗毅/刘军 将进行题为"Introducing Apache Dubbo(Incubating): What is Dubbo and How it Works"的演讲。',
          dateStr: 'May 2nd，2018',
          link: '/blog/apachecon-na-2018.md',
        },
        {
          img: './img/blog/qcon-beijing-2018.jpeg',
          title: 'Dubbo路线图在QCon Beijing 2018上公布',
          content: '罗毅在Qcon Beijing 2018上进行了Dubbo开源现状及未来规划的主题演讲。',
          dateStr: 'April 21st，2018',
          link: '/blog/qcon-beijing-2018.md',
        },
      ]
    },
    contacts: {
      title: '联系我们',
      desc: '有问题需要反馈？请通过一下方式联系我们。',
      list: [
        {
          img: './img/mailinglist.png',
          imgHover: './img/mailinglist_hover.png',
          title: '邮件列表',
          link: 'https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide'
        },
        {
          img: './img/alibaba.png',
          imgHover: './img/alibaba_hover.png',
          title: 'Gitter',
          link: 'https://gitter.im/alibaba/dubbo',
        },
        {
          img: './img/segmentfault.png',
          imgHover: './img/segmentfault_hover.png',
          title: 'Segment Fault',
          link: 'https://segmentfault.com/t/dubbo'
        },
        {
          img: './img/twitter.png',
          imgHover: './img/twitter_hover.png',
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
          img: './img/mailinglist.png',
          title: '邮件列表',
          content: <span>加入 <a href="https://github.com/apache/incubator-dubbo/wiki/New-contributor-guide">邮件列表 </a>参与讨论。</span>,
        },
        {
          img: './img/issue.png',
          title: '报告缺陷',
          content: <span>通过<a href="https://github.com/apache/incubator-dubbo/issues"> Github issues </a>报告缺陷。</span>,
        },
        {
          img: './img/documents.png',
          title: '文档',
          content: <span>优化Dubbo <a href="http://dubbo.apache.org/#/docs/"> 文档</a>。</span>,
        },
        {
          img: './img/pullrequest.png',
          title: 'Pull Request',
          content: <span>提交 <a href="https://github.com/apache/incubator-dubbo/pulls"> Pull requests </a>来修复问题。</span>,
        },
      ],
    },
    ecos: {
      title: '生态系统',
      list: [
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
          ],
        },
        {
          title: 'API',
          content: <span>Dubbo支持通过多种API方式启动:</span>,
          tags: [
            {
              text: 'Spring XML',
              link: '#/docs/configuration/xml.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Spring Annotation',
              link: '#/docs/configuration/annotation.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Plain Java',
              link: '#/docs/configuration/properties.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Spring-boot',
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
              link: '#/docs/references/registry/zookeeper.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Redis',
              link: '#/docs/references/registry/redis.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Simple',
              link: '#/docs/references/registry/simple.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Multicast',
              link: '#/docs/references/registry/multicast.md',
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
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Fail safe',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail fast',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Fail back',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Forking',
              link: '#/docs/demos/fault-tolerent-strategy.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Broadcast',
              link: '#/docs/demos/fault-tolerent-strategy.md',
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
              link: '#/docs/demos/loadbalance.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'Least Active',
              link: '#/docs/demos/loadbalance.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Round Robin',
              link: '#/docs/demos/loadbalance.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Consistent hash',
              link: '#/docs/demos/loadbalance.md',
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
              link: '#/docs/references/protocol/dubbo.md',
              bgColor: '#7A63FC',
            },
            {
              text: 'RMI',
              link: '#/docs/references/protocol/rmi.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Hessian',
              link: '#/docs/references/protocol/hessian.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'HTTP',
              link: '#/docs/references/protocol/http.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'WebService',
              link: '#/docs/references/protocol/webservice.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Thrift',
              link: '#/docs/references/protocol/thrift.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Memcached',
              link: '#/docs/references/protocol/memcached.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Redis',
              link: '#/docs/references/protocol/redis.md',
              bgColor: '#00D0D9',
            },
            {
              text: 'Rest',
              link: '#/docs/references/protocol/rest.md',
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
              link: '#/docs/demos/netty4.md',
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
              text: 'p2p',
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
            }
          ]
        },
      ],
    },
  },
};
