export default {
  'en-us': {
    title: 'build production-ready microservices',
    desc: 'Apache Dubbo Ecosystem contains multiple projects around Apache Dubbo, which provides production-ready best practices to build microservices applications.',
    body: [
      {
        title: 'RPC Core',
        bgColor: '#834be3',
        children: [
          {
            title: 'Cluster',
            children: [
              {
                name: 'Failover',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failfast',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failsafe',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failback',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Forking',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: 'Load Balance',
            children: [
              {
                name: 'Random',
                img: '/img/ecology/dubbo.svg',
                desc: 'Ramdom, set random probabilities by weight.',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Round Robin',
                img: '/img/ecology/dubbo.svg',
                desc: 'RoundRobin, use the weight\' s common advisor to determine round robin ratio',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
             },
            {
                name: 'Least Active',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Consitent Hash',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: 'Protocol',
            children: [
              {
                name: 'Dubbo',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'REST',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Hessian',
                img: '/img/ecology/caucho-hessian.jpg',
                desc: 'it is well-suited to sending binary data without any need to extend the protocol with attachments',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://hessian.caucho.com/',
                repository: 'https://github.com/apache/dubbo-hessian-lite',
              },
              {
                name: 'HTTP',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JMS',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JSONRPC',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'WebService',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'RMI',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Native Thrift',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Redis',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'XMLRPC',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Memcached',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Transport',
            children: [
              {
                name: 'Netty4',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Grizzly',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Jetty',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Mina',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'P2P',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Seriliazation',
            children: [
              {
                name: 'Hessian2',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Avro',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Java',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JSON',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Fst',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Kryo',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Mesh',
            children: [
              {
                name: 'Dubbo mesh (under development)',
                img: '/img/ecology/envoy.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/envoyproxy/envoy',
                repository: 'https://github.com/envoyproxy/envoy',
              },
            ],
          },
        ],
      },
      {
        title: 'Service Governance',
        bgColor: '#00D0D9',
        children: [
          {
            title: 'Registry',
            children: [
              {
                name: 'Zookeeper',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/etcd.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Consul',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Config',
            children: [
              {
                name: 'Zookeeper',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Apollo',
                img: '/img/ecology/apollo.svg',
                desc: 'Apollo is a reliable open-source configuration management system',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/ctripcorp/apollo',
                repository: 'https://github.com/ctripcorp/apollo',
              },
            ],
          },
          {
            title: 'Metrics',
            children: [
              {
                name: 'Dubbo-metrics',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Circuit braker',
            children: [
              {
                name: 'Sentinel',
                img: '/img/ecology/sentinel.svg',
                desc: 'A lightweight powerful flow control component enabling reliability and monitoring for microservices',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/Sentinel',
                repository: 'https://github.com/alibaba/Sentinel',
              },
              {
                name: 'Hystrix',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Reslience4j',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Administration',
            children: [
              {
                name: 'Dubbo admin',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
      {
        title: 'Microservice Components',
        bgColor: '#2DACEC',
        children: [
          {
            title: 'API Gateway',
            children: [
              {
                name: 'Kong',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Zuul',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: 'Tracing',
            children: [
              {
                name: 'Zookeeper',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Apollo',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Transaction',
            children: [
              {
                name: 'Seata',
                img: '/img/ecology/seata.svg',
                desc: 'Seata is an easy-to-use, high-performance, open source distributed transaction solution',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://seata.io/',
                repository: 'https://github.com/seata/seata',
              },
            ],
          },
          {
            title: 'Reliability',
            children: [
              {
                name: 'Sentinel',
                img: '/img/ecology/sentinel.svg',
                desc: 'A lightweight powerful flow control component enabling reliability and monitoring for microservices',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/Sentinel',
                repository: 'https://github.com/alibaba/Sentinel',
              },
              {
                name: 'Hystrix',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Reslience4j',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: 'Authorization',
            children: [
              {
                name: 'OAuth',
                img: '/img/ecology/oauth.png',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://oauth.net/',
                repository: 'https://oauth.net/code/java/',
              },
            ],
          },
          {
            title: 'Event',
            children: [
              {
                name: 'RocketMQ',
                img: '/img/ecology/apache-rocket-mq.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Scheduling',
            children: [
              {
                name: 'BBB',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'OpenAPI',
            children: [
              {
                name: 'Swagger',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Function',
            children: [
              {
                name: 'Costa',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
      {
        title: 'Devloper Experience',
        bgColor: '#EA73D7',
        children: [
          {
            title: 'Bootstrap',
            children: [
              {
                name: 'zuulfels',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              }
            ]
          },
          {
            title: 'Multi-language SDK',
            children: [
              {
                name: 'Java',
                img: '/img/ecology/java.png',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Node.js',
                img: '/img/ecology/nodejs.jpeg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo-js',
              },
              {
                name: 'Python',
                img: '/img/ecology/python.png',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Php',
                img: '/img/ecology/php.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Go',
                img: '/img/ecology/go-blue.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'API',
            children: [
              {
                name: 'XML',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Annotation',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Java',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Spring Boot',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Developer Experience',
            children: [
              {
                name: 'IDEA Plugin',
                img: '/img/ecology/idea.jpeg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JMeter Plugin',
                img: '/img/ecology/jmeter.jpeg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
      {
        title: 'Observability',
        bgColor: '#00D0D9',
        children: [
          {
            title: 'Monitoring',
            children: [
              {
                name: 'Prometheus',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Tracing',
            children: [
              {
                name: 'OpenTracing',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Logging',
            children: [
              {
                name: 'ElasticSearch',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Diagostics',
            children: [
              {
                name: 'Arthas',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Chaos Engineering',
            children: [
              {
                name: 'Temp',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
    ],
  },
  'zh-cn': {
    title: '构建产品级微服务',
    desc: 'Apache Dubbo生态系统包含围绕Apache Dubbo的多个工程，为构建微服务应用提供了产品级的最佳实践',
    body: [
      {
        title: 'RPC核心',
        bgColor: '#834be3',
        children: [
          {
            title: '集群',
            children: [
              {
                name: 'Dubbo',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'zuul',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'NBC',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Beats',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'NASA',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: '负载均衡',
            children: [
              {
                name: 'Random',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Round Robin',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Least Active',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Consitent Hash',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: '协议',
            children: [
              {
                name: 'Dubbo',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'REST',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Hessian',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'HTTP',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JMS',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JSONRPC',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'WebService',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'RMI',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Native Thrift',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Redis',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'XMLRPC',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Memcached',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '传输',
            children: [
              {
                name: 'Netty4',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Grizzly',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Jetty',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Mina',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'P2P',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '序列化',
            children: [
              {
                name: 'Hessian2',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Avro',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Java',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JSON',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Fst',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Kryo',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Mesh',
            children: [
              {
                name: 'Dubbo-mesh',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
      {
        title: '服务治理',
        bgColor: '#00D0D9',
        children: [
          {
            title: '注册中心',
            children: [
              {
                name: 'Zookeeper',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Consul',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '配置中心',
            children: [
              {
                name: 'Zookeeper',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Apollo',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '指标',
            children: [
              {
                name: 'Dubbo-metrics',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '断路器',
            children: [
              {
                name: 'Sentinel',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Hystrix',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Reslience4j',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '管理控制台',
            children: [
              {
                name: 'Dubbo admin',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
      {
        title: '微服务组件',
        bgColor: '#2DACEC',
        children: [
          {
            title: 'API 网关',
            children: [
              {
                name: 'Kong',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Zuul',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: '事务',
            children: [
              {
                name: 'Seata',
                img: '/img/ecology/seata.svg',
                desc: 'Seata is an easy-to-use, high-performance, open source distributed transaction solution',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://seata.io/',
                repository: 'https://github.com/seata/seata',
              },
            ],
          },
          {
            title: '可靠性',
            children: [
              {
                name: 'Sentinel',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Hystrix',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Reslience4j',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ]
          },
          {
            title: '授权',
            children: [
              {
                name: 'OAuth',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '事件',
            children: [
              {
                name: 'RocketMQ',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '调度',
            children: [
              {
                name: 'BBB',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'OpenAPI',
            children: [
              {
                name: 'Swagger',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Function',
            children: [
              {
                name: 'Costa',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
      {
        title: '开发者体验',
        bgColor: '#EA73D7',
        children: [
          {
            title: 'Bootstrap',
            children: [
              {
                name: 'zuulfels',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              }
            ]
          },
          {
            title: '多语言SDK',
            children: [
              {
                name: 'Java',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Node.js',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Python',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Php',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Go',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'API',
            children: [
              {
                name: 'XML',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Annotation',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Java',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Spring Boot',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '开发者体验',
            children: [
              {
                name: 'IDEA 插件',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JMeter 插件',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
      {
        title: '可观察性',
        bgColor: '#00D0D9',
        children: [
          {
            title: '监控',
            children: [
              {
                name: 'Prometheus',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '追踪',
            children: [
              {
                name: 'OpenTracing',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '日志',
            children: [
              {
                name: 'ElasticSearch',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '诊断',
            children: [
              {
                name: 'Arthas',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '混沌工程',
            children: [
              {
                name: 'Temp',
                img: '/img/ecology/dubbo.svg',
                desc: 'test123',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
        ],
      },
    ],
  },
};
