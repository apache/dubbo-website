import React from 'react';

export default {
  'zh-cn': {
    brand: {
      brandName: 'Apache Dubbo',
      briefIntroduction: 'Apache Dubbo™ (incubating)是一款高性能Java RPC框架。',
      getStartedButton: {
        text: '快速开始',
        link: '/zh-cn/docs/user/quick-start.html',
      },
      viewOnGithubButton: {
        text: '在Github中查看',
        link: 'https://github.com/apache/incubator-dubbo',
      }
    },
    introduction: {
      title: '高性能Java RPC框架',
      desc: 'Apache Dubbo (incubating) |ˈdʌbəʊ| 是一款高性能、轻量级的开源Java RPC框架，它提供了三大核心能力：面向接口的远程方法调用，智能容错和负载均衡，以及服务自动注册和发现。',
      img: '/img/architecture.png',
    },
    features: {
      title: '特性一览',
      list: [
        {
          img: '/img/feature_transpart.png',
          title: '面向接口代理的高性能RPC调用',
          content: '提供高性能的基于代理的远程调用能力，服务以接口为粒度，为开发者屏蔽远程调用底层细节。',
        },
        {
          img: '/img/feature_loadbalances.png',
          title: '智能负载均衡',
          content: '内置多种负载均衡策略，智能感知下游节点健康状况，显著减少调用延迟，提高系统吞吐量。',
        },
        {
          img: '/img/feature_service.png',
          title: '服务自动注册与发现',
          content: '支持多种注册中心服务，服务实例上下线实时感知。',
        },
        {
          img: '/img/feature_hogh.png',
          title: '高度可扩展能力',
          content: '遵循微内核+插件的设计原则，所有核心能力如Protocol、Transport、Serialization被设计为扩展点，平等对待内置实现和第三方实现。',
        },
        {
          img: '/img/feature_runtime.png',
          title: '运行期流量调度',
          content: '内置条件、脚本等路由策略，通过配置不同的路由规则，轻松实现灰度发布，同机房优先等功能。',
        },
        {
          img: '/img/feature_maintenance.png',
          title: '可视化的服务治理与运维',
          content: '提供丰富服务治理、运维工具：随时查询服务元数据、服务健康状态及调用统计，实时下发路由策略、调整配置参数。',
        },
      ],
    },
    start: {
      title: '快速开始',
      desc: '只需通过几行代码即可快速构建一个Dubbo应用。',
      img: '/img/quick_start.png',
      button: {
        text: '阅读更多',
        link: '/zh-cn/docs/user/quick-start.html',
      },
    },
    users: {
      title: '谁在使用Dubbo',
      desc: <span>请在 <a rel="noopener noreferrer" target="_blank" href="https://github.com/apache/incubator-dubbo/issues/1012">Wanted: who&#39;s using dubbo</a> 上提供信息来帮助Dubbo做的更好。</span>,
      list: [
        '/img/users_alibaba.png',
        '/img/users_kingdee.png',
        '/img/users_dangdang.png',
        '/img/users_didi.png',
        '/img/users_qunar.png',
        '/img/users_wanglian.png',
        '/img/users_kaola.png',
        '/img/users_zhengcaiyun.png',
        '/img/users_chinalife.png',
        '/img/users_haier.png',
        '/img/users_yinlian.png',
        '/img/users_telecom.png',
        '/img/users_weidian.png',
        '/img/users_icbc.png',
        '/img/users_handu.png',
        '/img/users_rograndec.png',
        // '/img/users_other1.png',
        // '/img/users_other2.png'
      ],
    },
  },
  'en-us': {
    brand: {
      brandName: 'Apache Dubbo',
      briefIntroduction: 'Apache Dubbo™ (incubating) is a high-performance, java based open source RPC framework.',
      getStartedButton: {
        text: 'GET STARTED',
        link: '/en-us/docs/user/quick-start.html',
      },
      viewOnGithubButton: {
        text: 'VIEW ON GITHUB',
        link: 'https://github.com/apache/incubator-dubbo',
      }
    },
    introduction: {
      title: 'A high performance Java RPC framework',
      desc: 'Apache Dubbo (incubating) |ˈdʌbəʊ| is a high-performance, light weight, java based RPC framework. Dubbo offers three key functionalities, which include interface based remote call, fault tolerance & load balancing, and automatic service registration & discovery.',
      img: '/img/architecture.png',
    },
    features: {
      title: 'Feature List',
      list: [
        {
          img: '/img/feature_transpart.png',
          title: 'Transparent interface based RPC',
          content: 'Dubbo provides high performance interface based RPC, which is transparent to users.',
        },
        {
          img: '/img/feature_loadbalances.png',
          title: 'Intelligent load balancing',
          content: 'Dubbo supports multiple load balancing strategies out of the box, which perceives downstream service status to reduce overall latency and improve system throughput.',
        },
        {
          img: '/img/feature_service.png',
          title: 'Automatic service registration and discovery',
          content: 'Dubbo supports multiple service registries, which can detect service online/offline instantly.',
        },
        {
          img: '/img/feature_hogh.png',
          title: 'High extensibility',
          content: 'Dubbo\'s micro-kernel and plugin design ensures that it can easily be extended by third party implementation across core features like Protocol, Transport, and Serialization.',
        },
        {
          img: '/img/feature_runtime.png',
          title: 'Runtime traffic routing',
          content: 'Dubbo can be configured at runtime so that traffic can be routed according to different rules, which makes it easy to support features like blue-green deployment, data center aware routing, etc.',
        },
        {
          img: '/img/feature_maintenance.png',
          title: 'Visualized service governance',
          content: 'Dubbo provides rich tools for service governance and maintenance such as querying service metadata, health status and statistics.',
        }
      ]
    },
    start: {
      title: 'Quick start',
      desc: 'This guide gets you started with dubbo in Java with a simple working example.',
      img: '/img/quick_start.png',
      button: {
        text: 'READ MORE',
        link: '/en-us/docs/user/quick-start.html',
      },
    },
    users: {
      title: 'Who is using Dubbo',
      desc: <span>Providing your info on <a rel="noopener noreferrer" target="_blank" href="https://github.com/apache/incubator-dubbo/issues/1012">Wanted: who&#39;s using dubbo</a> to help improving dubbo better</span>,
      list: [
        '/img/users_alibaba.png',
        '/img/users_kingdee.png',
        '/img/users_dangdang.png',
        '/img/users_didi.png',
        '/img/users_qunar.png',
        '/img/users_wanglian.png',
        '/img/users_kaola.png',
        '/img/users_zhengcaiyun.png',
        '/img/users_chinalife.png',
        '/img/users_haier.png',
        '/img/users_yinlian.png',
        '/img/users_telecom.png',
        '/img/users_weidian.png',
        '/img/users_icbc.png',
        '/img/users_handu.png',
        '/img/users_rograndec.png',
        // '/img/users_other1.png',
        // '/img/users_other2.png'
      ],
    },
  },
};
