export default {
  'en-us': {
    title: 'Build production-ready microservices',
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
                desc: 'Cluster and fault tolerance strategy of Apache Dubbo : failover',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Cluster',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failfast',
                img: '/img/ecology/dubbo.svg',
                desc: 'Cluster and fault tolerance strategy of Apache Dubbo : failfast',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Cluster',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failsafe',
                img: '/img/ecology/dubbo.svg',
                desc: 'Cluster and fault tolerance strategy of Apache Dubbo : failsafe',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Cluster',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failback',
                img: '/img/ecology/dubbo.svg',
                desc: 'Cluster and fault tolerance strategy of Apache Dubbo : failback',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Cluster',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Forking',
                img: '/img/ecology/dubbo.svg',
                desc: 'Cluster and fault tolerance strategy of Apache Dubbo : forking',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Cluster',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/fault-tolerent-strategy.html',
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
                desc: 'Load Balance strategy  of Apache Dubbo : Ramdom, set random probabilities by weight.',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Load Balance',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Round Robin',
                img: '/img/ecology/dubbo.svg',
                desc: 'Load Balance strategy  of Apache Dubbo : RoundRobin, use the weight\'s common advisor to determine round robin ratio.',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Load Balance',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
             },
            {
                name: 'Least Active',
                img: '/img/ecology/dubbo.svg',
                desc: 'Load Balance strategy  of Apache Dubbo : LeastActive, a random mechanism based on actives, actives means the num of requests a consumer have sent but not return yet。',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Load Balance',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Consitent Hash',
                img: '/img/ecology/dubbo.svg',
                desc: 'Load Balance strategy  of Apache Dubbo : ConsistentHash, the same parameters of the request is always sent to the same provider.',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Load Balance',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/demos/loadbalance.html',
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
                desc: 'Dubbo protocol which is the default protocol of Dubbo RPC Framework',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/dubbo.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'REST',
                img: '/img/ecology/dubbo.svg',
                desc: 'REST Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/rest.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Hessian',
                img: '/img/ecology/caucho-hessian.jpg',
                desc: 'Hessian Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/hessian.html',
                repository: 'https://github.com/apache/dubbo-hessian-lite',
              },
              {
                name: 'HTTP',
                img: '/img/ecology/dubbo.svg',
                desc: 'HTTP Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/http.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JMS (under development)',
                img: '/img/ecology/dubbo.svg',
                desc: 'jms support for apache dubbo',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/jms-for-apache-dubbo',
                repository: 'https://github.com/thubbo/jms-for-apache-dubbo',
              },
              {
                name: 'JSONRPC',
                img: '/img/ecology/dubbo.svg',
                desc: 'dubbo rpc jsonrpc',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-rpc-jsonrpc',
                repository: 'https://github.com/apache/dubbo/tree/master/dubbo-rpc/dubbo-rpc-jsonrpc',
              },
              {
                name: 'WebService',
                img: '/img/ecology/dubbo.svg',
                desc: 'WebService Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/webservice.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'RMI',
                img: '/img/ecology/dubbo.svg',
                desc: 'RMI Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/rmi.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Native Thrift',
                img: '/img/ecology/apache-thrift.svg',
                desc: 'Thrift Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/thrift.html',
                repository: 'https://github.com/apache/thrift',
              },
              {
                name: 'Redis',
                img: '/img/ecology/redis.jpeg',
                desc: 'Redis Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/redis.html',
                repository: 'https://github.com/antirez/redis',
              },
              {
                name: 'Memcached',
                img: '/img/ecology/memcached.jpg',
                desc: 'Memcached Protocol',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Protocol',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/protocol/memcached.html',
                repository: 'https://github.com/memcached/memcached',
              },
            ],
          },
          {
            title: 'Transport',
            children: [
              {
                name: 'Netty',
                img: '/img/ecology/netty.png',
                desc: 'Netty project - an event-driven asynchronous network application framework',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Transport',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://netty.io/',
                repository: 'https://github.com/netty/netty',
              },
              {
                name: 'Grizzly',
                img: '/img/ecology/grizzly.png',
                desc: 'The Grizzly NIO framework has been designed to help developers to take advantage of the Java™ NIO API',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Transport',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://javaee.github.io/grizzly/',
                repository: 'https://github.com/javaee/grizzly/',
              },
              {
                name: 'Jetty',
                img: '/img/ecology/jetty.png',
                desc: 'Web Container & Clients - supports HTTP/2, HTTP/1.1, HTTP/1.0, websocket, servlets, and more',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Transport',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://www.eclipse.org/jetty/',
                repository: 'https://github.com/eclipse/jetty.project',
              },
              {
                name: 'Mina',
                img: '/img/ecology/mina.png',
                desc: 'Apache MINA is a network application framework which helps users develop high performance and high scalability network applications easily.',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Transport',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://mina.apache.org',
                repository: 'https://github.com/apache/mina',
              },
              {
                name: 'P2P',
                img: '/img/ecology/dubbo.svg',
                desc: 'Extension of Apache Dubbo for peer to peer network grouping.',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Transport',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/dev/impls/networker.html',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: 'Seriliazation',
            children: [
              {
                name: 'Hessian2',
                img: '/img/ecology/caucho-hessian.jpg',
                desc: 'dubbo-hessian-lite is a Apache dubbo embed version of official hessian',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Seriliazation',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://hessian.caucho.com/',
                repository: 'https://github.com/apache/dubbo-hessian-lite',
              },
              {
                name: 'Avro',
                img: '/img/ecology/avro.svg',
                desc: 'Apache Avro™ is a data serialization system.',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Seriliazation',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://avro.apache.org/',
                repository: 'https://github.com/apache/avro',
              },
              {
                name: 'Java',
                img: '/img/ecology/java.png',
                desc: 'Jdk serialization',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Seriliazation',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/dev/impls/serialize.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JSON - fastjson',
                img: '/img/ecology/fastjson.jpg',
                desc: 'A fast JSON parser/generator for Java',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Seriliazation',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/fastjson',
                repository: 'https://github.com/alibaba/fastjson',
              },
              {
                name: 'Fst',
                img: '/img/ecology/java.png',
                desc: 'FST: fast java serialization drop in-replacement',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Seriliazation',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/RuedigerMoeller/fast-serialization',
                repository: 'https://github.com/RuedigerMoeller/fast-serialization',
              },
              {
                name: 'Kryo',
                img: '/img/ecology/kyro.jpeg',
                desc: 'Kryo is a fast and efficient binary object graph serialization framework for Java',
                tags: [
                  {
                    text: 'RPC Core',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Seriliazation',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/EsotericSoftware/kryo',
                repository: 'https://github.com/EsotericSoftware/kryo',
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
                img: '/img/ecology/apache-zookeeper.svg',
                desc: 'Apache ZooKeeper is an effort to develop and maintain an open-source server which enables highly reliable distributed coordination',
                tags: [
                  {
                    text: 'Service Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Registry',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/registry/zookeeper.html',
                repository: 'https://github.com/apache/zookeeper',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/etcd.svg',
                desc: 'Distributed reliable key-value store for the most critical data of a distributed system',
                tags: [
                  {
                      text: 'Service Governance',
                      bgColor: '#835BE3',
                  },
                  {
                      text: 'Registry',
                      bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/references/registry/introduction.html',
                repository: 'https://github.com/etcd-io/etcd',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/nacos.svg',
                desc: 'Nacos Registry',
                tags: [
                    {
                      text: 'Service Governance',
                      bgColor: '#835BE3',
                    },
                    {
                      text: 'Registry',
                      bgColor: '#00D0D9',
                    },
                ],
                website: 'https://nacos.io/en-us/',
                repository: 'https://github.com/alibaba/nacos',
              },
              {
                name: 'Consul',
                img: '/img/ecology/consul.svg',
                desc: 'Consul Registry',
                tags: [
                      {
                          text: 'Service Governance',
                          bgColor: '#835BE3',
                      },
                      {
                          text: 'Registry',
                          bgColor: '#00D0D9',
                      },
                ],
                website: 'https://www.consul.io/',
                repository: 'https://github.com/hashicorp/consul',
              },
            ],
          },
          {
            title: 'Config Center',
            children: [
                {
                    name: 'Zookeeper',
                    img: '/img/ecology/apache-zookeeper.svg',
                    desc: 'Apache ZooKeeper is an effort to develop and maintain an open-source server which enables highly reliable distributed coordination',
                    tags: [
                        {
                            text: 'Zookeeper Governance',
                            bgColor: '#835BE3',
                        },
                        {
                            text: 'Config Center',
                            bgColor: '#00D0D9',
                        },
                    ],
                    website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/config-center.html',
                    repository: 'https://github.com/apache/zookeeper',
                },
                {
                    name: 'Etcd',
                    img: '/img/ecology/etcd.svg',
                    desc: 'Distributed reliable key-value store for the most critical data of a distributed system ',
                    tags: [
                        {
                          text: 'Service Governance',
                          bgColor: '#835BE3',
                        },
                        {
                          text: 'Config Center',
                          bgColor: '#00D0D9',
                        },
                    ],
                    website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/config-center.html',
                    repository: 'hhttps://github.com/etcd-io/etcd',
                },
                {
                    name: 'Nacos',
                    img: '/img/ecology/nacos.svg',
                    desc: 'an easy-to-use dynamic service discovery, configuration and service management platform for building cloud native applications.',
                    tags: [
                      {
                        text: 'Service Governance',
                        bgColor: '#835BE3',
                      },
                      {
                        text: 'Config Center',
                        bgColor: '#00D0D9',
                      },
                    ],
                    website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/config-center.html',
                    repository: 'https://github.com/alibaba/nacos',
                },
              {
                name: 'Apollo',
                img: '/img/ecology/apollo.svg',
                desc: 'Apollo is a reliable open-source configuration management system',
                tags: [
                  {
                    text: 'Service Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Config Center',
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
                name: 'Dubbo metrics',
                img: '/img/ecology/dubbo.svg',
                desc: 'The metrics library for Apache Dubbo and any frameworks or systems',
                tags: [
                  {
                    text: 'Service Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Metrics',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/metrics',
                repository: 'https://github.com/alibaba/metrics',
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
                    text: 'Service Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Circuit braker',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/Sentinel',
                repository: 'https://github.com/alibaba/Sentinel',
              },
              {
                name: 'Hystrix',
                img: '/img/ecology/hystrix.png',
                desc: 'Hystrix: Latency and Fault Tolerance for Distributed Systems',
                tags: [
                  {
                    text: 'Service Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Circuit braker',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/Netflix/Hystrix',
                repository: 'https://github.com/Netflix/Hystrix',
              },
              {
                name: 'Resilience4j',
                img: '/img/ecology/resilience4j.png',
                desc: 'Resilience4j is a fault tolerance library designed for Java8 and functional programming',
                tags: [
                  {
                    text: 'Service Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Circuit braker',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://resilience4j.readme.io/',
                repository: 'https://github.com/resilience4j/resilience4j',
              },
            ],
          },
          {
            title: 'Administration',
            children: [
              {
                name: 'Dubbo admin',
                img: '/img/ecology/dubbo.svg',
                desc: 'The ops and reference implementation for Apache Dubbo',
                tags: [
                  {
                    text: 'Service Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Administration',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/admin/introduction.html',
                repository: 'https://github.com/apache/dubbo-admin',
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
            title: 'API Gateway (TODO)',
            children: [
              {
                name: 'Kong',
                img: '/img/ecology/kong.svg',
                desc: 'The Cloud-Native API Gateway',
                tags: [
                  {
                    text: 'Microservice Components',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API Gateway',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://konghq.com',
                repository: 'https://github.com/Kong/kong',
              },
              {
                name: 'Zuul',
                img: '/img/ecology/netflix-zuul.svg',
                desc: 'Zuul is a gateway service that provides dynamic routing, monitoring, resiliency, security, and more.',
                tags: [
                  {
                    text: 'Microservice Components',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API Gateway',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/Netflix/zuul',
                repository: 'https://github.com/Netflix/zuul',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/nacos.svg',
                desc: 'an easy-to-use dynamic service discovery, configuration and service management platform for building cloud native applications.',
                tags: [
                  {
                    text: 'Microservice Components',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API Gateway',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://nacos.io/',
                repository: 'https://github.com/alibaba/nacos',
              },
              {
                name: 'Dubbo proxy (under development)',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo Proxy, a gateway of Apache Dubbo',
                tags: [
                  {
                    text: 'Microservice Components',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API Gateway',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-proxy',
                repository: 'https://github.com/apache/dubbo-proxy',
              },
            ]
          },
          {
            title: 'Tracing',
            children: [
              {
                name: 'OpenTracing (TODO)',
                img: '/img/ecology/opentracing.png',
                desc: 'Consistent, expressive, vendor-neutral APIs for distributed tracing and context propagation',
                tags: [
                  {
                    text: 'Microservice Components',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Tracing',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://opentracing.io/',
                repository: 'https://github.com/opentracing',
              },
              {
                name: 'SkyWalking',
                img: '/img/ecology/sky-walking.svg',
                desc: 'APM, Application Performance Monitoring System',
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
                website: 'https://skywalking.apache.org/',
                repository: 'https://github.com/apache/skywalking',
              },
              {
                name: 'Zipkin',
                img: '/img/ecology/zipkin.svg',
                desc: 'Zipkin is a distributed tracing system',
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
                website: 'https://zipkin.io/',
                repository: 'https://github.com/openzipkin/zipkin',
              },
              {
                name: 'Pinpoint',
                img: '/img/ecology/pinpoint.svg',
                desc: 'APM, (Application Performance Management) tool for large-scale distributed systems written in Java',
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
                website: 'https://naver.github.io/pinpoint/',
                repository: 'https://github.com/naver/pinpoint',
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
                img: '/img/ecology/hystrix.png',
                desc: 'Hystrix: Latency and Fault Tolerance for Distributed Systems',
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
                website: 'https://github.com/Netflix/Hystrix',
                repository: 'https://github.com/Netflix/Hystrix',
              },
              {
                name: 'Resilience4j',
                img: '/img/ecology/resilience4j.png',
                desc: 'Resilience4j is a fault tolerance library designed for Java8 and functional programming',
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
                website: 'https://resilience4j.readme.io/',
                repository: 'https://github.com/resilience4j/resilience4j',
              },
            ]
          },
          {
            title: 'Authorization (TODO)',
            children: [
              {
                name: 'OAuth',
                img: '/img/ecology/oauth.png',
                desc: 'An open protocol to allow secure authorization in a simple and standard method from web, mobile and desktop applications.',
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
                repository: 'https://oauth.net/code/',
              },
            ],
          },
          {
            title: 'Event',
            children: [
              {
                name: 'RocketMQ',
                img: '/img/ecology/apache-rocket-mq.svg',
                desc: 'Apache RocketMQ is a distributed messaging and streaming platform with low latency, high performance and reliability, trillion-level capacity and flexible scalability.',
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
                website: 'http://rocketmq.apache.org',
                repository: 'https://github.com/apache/rocketmq',
              },
            ],
          },
          {
            title: 'OpenAPI',
            children: [
              {
                name: 'Swagger',
                img: '/img/ecology/swagger.svg',
                desc: 'Simplify API development for users, teams, and enterprises with the Swagger open source and professional toolset. ',
                tags: [
                  {
                    text: 'Registry',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'OpenAPI',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://swagger.io/',
                repository: 'https://github.com/apache/dubbo-admin',
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
                name: 'Initializr',
                img: '/img/ecology/dubbo.svg',
                desc: 'A quickstart generator for Dubbo + Spring projects ',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Bootstrap',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/initializr',
                repository: 'https://github.com/thubbo/initializr',
              }
            ]
          },
          {
            title: 'Multi-language SDK',
            children: [
              {
                name: 'Java',
                img: '/img/ecology/java.png',
                desc: 'Dubbo Java client',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Multi-language SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Go',
                img: '/img/ecology/go.png',
                desc: 'Go Implementation For Apache Dubbo',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Multi-language SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-go',
                repository: 'https://github.com/apache/dubbo-go',
              },
              {
                name: 'Node.js',
                img: '/img/ecology/nodejs.jpeg',
                desc: 'Dubbo Node.js client',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Multi-language SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-js',
                repository: 'https://github.com/apache/dubbo-js',
              },
              {
                name: 'Python',
                img: '/img/ecology/python.png',
                desc: 'Dubbo python client',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Multi-language SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-python',
                repository: 'https://github.com/apache/dubbo-python',
              },
              {
                name: 'Php',
                img: '/img/ecology/php.jpg',
                desc: 'Dubbo php client',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Multi-language SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-php-framework',
                repository: 'https://github.com/apache/dubbo-php-framework',
              },
              {
                name: 'Erlang',
                img: '/img/ecology/erlang.png',
                desc: 'Dubbo erlang client',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Multi-language SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/en-us/docs/user/languages/erlang/start.html',
                repository: 'https://github.com/apache/dubbo-erlang',
              },
            ],
          },
          {
            title: 'API',
            children: [
              {
                name: 'XML',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo XML Configuration',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/en-us/docs/user/configuration/xml.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Annotation',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo Annotation Configuration',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/en-us/docs/user/configuration/annotation.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Java',
                img: '/img/ecology/dubbo.svg',
                desc: 'Java API of Dubbo Configuration',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/en-us/docs/user/configuration/api.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Spring Boot',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo Sprng Boot Configuration',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-spring-boot-project',
                repository: 'https://github.com/apache/dubbo-spring-boot-project',
              },
            ],
          },
          {
            title: 'Developer Experience',
            children: [
              {
                name: 'IDEA Plugin',
                img: '/img/ecology/idea.jpeg',
                desc: 'Intellij Idea plugin for Dubbo project scaffold',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Developer Experience',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/intellij-idea-plugin',
                repository: 'https://github.com/thubbo/intellij-idea-plugin',
              },
              {
                name: 'JMeter Plugin',
                img: '/img/ecology/jmeter.jpeg',
                desc: 'Dubbo Plugin for Apache JMeter, It is a plug-in developed for testing Dubbo in Jmeter',
                tags: [
                  {
                    text: 'Devloper Experience',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Developer Experience',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/jmeter-plugins-for-apache-dubbo',
                repository: 'https://github.com/thubbo/jmeter-plugins-for-apache-dubbo',
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
                img: '/img/ecology/prometheus.svg',
                desc: 'The Prometheus monitoring system and time series database',
                tags: [
                  {
                    text: 'Observability',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Monitoring',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://prometheus.io/',
                repository: 'https://github.com/prometheus/prometheus',
              },
            ],
          },
          {
            title: 'Tracing',
            children: [
              {
                name: 'OpenTracing (TODO)',
                img: '/img/ecology/opentracing.png',
                desc: 'Consistent, expressive, vendor-neutral APIs for distributed tracing and context propagation',
                tags: [
                  {
                    text: 'Observability',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Tracing',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://opentracing.io/',
                repository: 'https://github.com/opentracing',
              },
              {
                name: 'SkyWalking',
                img: '/img/ecology/sky-walking.svg',
                desc: 'APM, Application Performance Monitoring System',
                tags: [
                  {
                    text: 'Observability',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Tracing',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://skywalking.apache.org/',
                repository: 'https://github.com/apache/skywalking',
              },
              {
                name: 'Zipkin',
                img: '/img/ecology/zipkin.svg',
                desc: 'Zipkin is a distributed tracing system',
                tags: [
                  {
                    text: 'Observability',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Tracing',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://zipkin.io/',
                repository: 'https://github.com/openzipkin/zipkin',
              },
              {
                name: 'Pinpoint',
                img: '/img/ecology/pinpoint.svg',
                desc: 'APM, (Application Performance Management) tool for large-scale distributed systems written in Java.',
                tags: [
                  {
                    text: 'Observability',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Tracing',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://naver.github.io/pinpoint/',
                repository: 'https://github.com/naver/pinpoint',
              },
            ],
          },
          {
            title: 'Logging',
            children: [
              {
                name: 'ElasticSearch',
                img: '/img/ecology/elastic.svg',
                desc: 'Open Source, Distributed, RESTful Search Engine',
                tags: [
                  {
                    text: 'Observability',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Logging',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://www.elastic.co',
                repository: 'https://github.com/elastic/elasticsearch',
              },
            ],
          },
          {
            title: 'Diagostics',
            children: [
              {
                name: 'Arthas',
                img: '/img/ecology/arthas.png',
                desc: 'Alibaba Java Diagnostic Tool Arthas',
                tags: [
                  {
                    text: 'Observability',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Diagostics',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://alibaba.github.io/arthas/',
                repository: 'https://github.com/alibaba/arthas',
              },
            ],
          },
          {
            title: 'Chaos Engineering',
            children: [],
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
        title: 'RPC 核心',
        bgColor: '#834be3',
        children: [
          {
            title: '集群容错',
            children: [
              {
                name: 'Failover',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的集群容错策略: failover',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '集群容错',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failfast',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的集群容错策略: Failfast',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '集群容错',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failsafe',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的集群容错策略: Failsafe',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '集群容错',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Failback',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的集群容错策略: Failback',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '集群容错',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Forking',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的集群容错策略: Forking',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '集群容错',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/fault-tolerent-strategy.html',
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
                desc: 'Apache Dubbo 的负载均衡策略: 随机，按权重设置随机概率。',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '负载均衡',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Round Robin',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的负载均衡策略: 轮询，按公约后的权重设置轮询比率。',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '负载均衡',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Least Active',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的负载均衡策略: 最少活跃调用数，相同活跃数的随机，活跃数指调用前后计数差。',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '负载均衡',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/loadbalance.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Consitent Hash',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo 的负载均衡策略: 一致性 Hash，相同参数的请求总是发到同一提供者',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '负载均衡',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/demos/loadbalance.html',
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
                desc: 'Dubbo 是Dubbo RPC 框架的默认协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/dubbo.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'REST',
                img: '/img/ecology/dubbo.svg',
                desc: 'REST 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/rest.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Hessian',
                img: '/img/ecology/caucho-hessian.jpg',
                desc: 'Hessian 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/hessian.html',
                repository: 'https://github.com/apache/dubbo-hessian-lite',
              },
              {
                name: 'HTTP',
                img: '/img/ecology/dubbo.svg',
                desc: 'HTTP 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/http.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JMS (under development)',
                img: '/img/ecology/dubbo.svg',
                desc: 'jms 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/jms-for-apache-dubbo',
                repository: 'https://github.com/thubbo/jms-for-apache-dubbo',
              },
              {
                name: 'JSONRPC',
                img: '/img/ecology/dubbo.svg',
                desc: 'dubbo rpc jsonrpc',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-rpc-jsonrpc',
                repository: 'https://github.com/apache/dubbo/tree/master/dubbo-rpc/dubbo-rpc-jsonrpc',
              },
              {
                name: 'WebService',
                img: '/img/ecology/dubbo.svg',
                desc: 'WebService 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/webservice.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'RMI',
                img: '/img/ecology/dubbo.svg',
                desc: 'RMI 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/rmi.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Native Thrift',
                img: '/img/ecology/apache-thrift.svg',
                desc: 'Thrift 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/thrift.html',
                repository: 'https://github.com/apache/thrift',
              },
              {
                name: 'Redis',
                img: '/img/ecology/redis.jpeg',
                desc: 'Redis 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/redis.html',
                repository: 'https://github.com/antirez/redis',
              },
              {
                name: 'Memcached',
                img: '/img/ecology/memcached.jpg',
                desc: 'Memcached 协议',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '协议',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/protocol/memcached.html',
                repository: 'https://github.com/memcached/memcached',
              },
            ],
          },
          {
            title: '传输',
            children: [
              {
                name: 'Netty',
                img: '/img/ecology/netty.png',
                desc: 'Netty 项目 - 一个事务驱动的异步网络应用框架',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '传输',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://netty.io/',
                repository: 'https://github.com/netty/netty',
              },
              {
                name: 'Grizzly',
                img: '/img/ecology/grizzly.png',
                desc: 'Grizzly NIO 框架设计用来帮助开发者利用Java™ NIO API',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '传输',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://javaee.github.io/grizzly/',
                repository: 'https://github.com/javaee/grizzly/',
              },
              {
                name: 'Jetty',
                img: '/img/ecology/jetty.png',
                desc: 'Web容器和客户端 - 支持 HTTP/2, HTTP/1.1, HTTP/1.0, websocket, servlets, 还有更多',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '传输',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://www.eclipse.org/jetty/',
                repository: 'https://github.com/eclipse/jetty.project',
              },
              {
                name: 'Mina',
                img: '/img/ecology/mina.png',
                desc: 'Apache MINA 是一个可以帮助用户更容易地开发高性能、高伸缩性网络应用的框架',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '传输',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://mina.apache.org',
                repository: 'https://github.com/apache/mina',
              },
              {
                name: 'P2P',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo的点对点网络通讯功能的扩展',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '传输',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/dev/impls/networker.html',
                repository: 'https://github.com/apache/dubbo',
              },
            ],
          },
          {
            title: '序列化',
            children: [
              {
                name: 'Hessian2',
                img: '/img/ecology/caucho-hessian.jpg',
                desc: 'dubbo-hessian-lite 是官方 hessian 的一个 Apache Dubbo 私有版本',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '序列化',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://hessian.caucho.com/',
                repository: 'https://github.com/apache/dubbo-hessian-lite',
              },
              {
                name: 'Avro',
                img: '/img/ecology/avro.svg',
                desc: 'Apache Avro™ 是一个数据序列化系统。',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '序列化',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://avro.apache.org/',
                repository: 'https://github.com/apache/avro',
              },
              {
                name: 'Java',
                img: '/img/ecology/java.png',
                desc: 'Jdk 序列化',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '序列化',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/dev/impls/serialize.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'JSON - fastjson',
                img: '/img/ecology/fastjson.jpg',
                desc: '一个Java版本内的 JSON 解析器/生成器',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '序列化',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/fastjson',
                repository: 'https://github.com/alibaba/fastjson',
              },
              {
                name: 'Fst',
                img: '/img/ecology/java.png',
                desc: 'FST: 一个快速的Java序列化工具',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '序列化',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/RuedigerMoeller/fast-serialization',
                repository: 'https://github.com/RuedigerMoeller/fast-serialization',
              },
              {
                name: 'Kryo',
                img: '/img/ecology/kyro.jpeg',
                desc: 'Kryo是一个Java版本的快速有效的二进制对象序列化框架',
                tags: [
                  {
                    text: 'RPC 核心',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '序列化',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/EsotericSoftware/kryo',
                repository: 'https://github.com/EsotericSoftware/kryo',
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
                img: '/img/ecology/apache-zookeeper.svg',
                desc: 'ApacheZooKeeper是一项服务于开发和维护开源服务器的框架，它能够实现高度可靠的分布式协作。',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '注册中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/registry/zookeeper.html',
                repository: 'https://github.com/apache/zookeeper',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/etcd.svg',
                desc: '服务于分布式系统中最关键数据的一个可靠的分布式键值存储',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '注册中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/references/registry/introduction.html',
                repository: 'https://github.com/etcd-io/etcd',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/nacos.svg',
                desc: 'Nacos 注册中心',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '注册中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://nacos.io/zh-cn/',
                repository: 'https://github.com/alibaba/nacos',
              },
              {
                name: 'Consul',
                img: '/img/ecology/consul.svg',
                desc: 'Consul 注册中心',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '注册中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://www.consul.io/',
                repository: 'https://github.com/hashicorp/consul',
              },
            ],
          },
          {
            title: '配置中心',
            children: [
              {
                name: 'Zookeeper',
                img: '/img/ecology/apache-zookeeper.svg',
                desc: 'ApacheZooKeeper是一项服务于开发和维护开源服务器的框架，它能够实现高度可靠的分布式协作。',
                tags: [
                  {
                    text: 'Zookeeper Governance',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '配置中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/config-center.html',
                repository: 'https://github.com/apache/zookeeper',
              },
              {
                name: 'Etcd',
                img: '/img/ecology/etcd.svg',
                desc: '服务于分布式系统中最关键数据的一个可靠的分布式键值存储',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '配置中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/config-center.html',
                repository: 'hhttps://github.com/etcd-io/etcd',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/nacos.svg',
                desc: '一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '配置中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/config-center.html',
                repository: 'https://github.com/alibaba/nacos',
              },
              {
                name: 'Apollo',
                img: '/img/ecology/apollo.svg',
                desc: 'Apollo（阿波罗）是携程框架部门研发的分布式配置中心。',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '配置中心',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/ctripcorp/apollo',
                repository: 'https://github.com/ctripcorp/apollo',
              },
            ],
          },
          {
            title: '指标',
            children: [
              {
                name: 'Dubbo metrics',
                img: '/img/ecology/dubbo.svg',
                desc: '为Apache Dubbo和任何其他框架、系统服务的指标库',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '指标',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/metrics',
                repository: 'https://github.com/alibaba/metrics',
              },
            ],
          },
          {
            title: '断路器',
            children: [
              {
                name: 'Sentinel',
                img: '/img/ecology/sentinel.svg',
                desc: '轻量级的流量控制、熔断降级 Java 库',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '断路器',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/Sentinel',
                repository: 'https://github.com/alibaba/Sentinel',
              },
              {
                name: 'Hystrix',
                img: '/img/ecology/hystrix.png',
                desc: 'Hystrix是一个延迟和容错库，旨在隔离对远程系统、服务和第三方库的访问点，停止级联故障，并在故障不可避免的复杂分布式系统中实现恢复能力。',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '断路器',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/Netflix/Hystrix',
                repository: 'https://github.com/Netflix/Hystrix',
              },
              {
                name: 'Resilience4j',
                img: '/img/ecology/resilience4j.png',
                desc: 'resilience4j是一个为java8和函数式编程而设计的容错库。',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '断路器',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://resilience4j.readme.io/',
                repository: 'https://github.com/resilience4j/resilience4j',
              },
            ],
          },
          {
            title: '管理控制台',
            children: [
              {
                name: 'Dubbo admin',
                img: '/img/ecology/dubbo.svg',
                desc: '为Dubbo管理员和开发者服务的控制台',
                tags: [
                  {
                    text: '服务治理',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '管理控制台',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/admin/introduction.html',
                repository: 'https://github.com/apache/dubbo-admin',
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
            title: 'API 网关 (TODO)',
            children: [
              {
                name: 'Kong',
                img: '/img/ecology/kong.svg',
                desc: '云原生 API 网关',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API 网关',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://konghq.com',
                repository: 'https://github.com/Kong/kong',
              },
              {
                name: 'Zuul',
                img: '/img/ecology/netflix-zuul.svg',
                desc: 'Zuul是一个网关服务，提供动态路由、监视、弹性、安全性等。',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API 网关',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/Netflix/zuul',
                repository: 'https://github.com/Netflix/zuul',
              },
              {
                name: 'Nacos',
                img: '/img/ecology/nacos.svg',
                desc: '一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API 网关',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://nacos.io/',
                repository: 'https://github.com/alibaba/nacos',
              },
              {
                name: 'Dubbo proxy (under development)',
                img: '/img/ecology/dubbo.svg',
                desc: 'Apache Dubbo的网关实现',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API 网关',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-proxy',
                repository: 'https://github.com/apache/dubbo-proxy',
              },
            ]
          },
          {
            title: '追踪',
            children: [
              {
                name: 'OpenTracing (TODO)',
                img: '/img/ecology/opentracing.png',
                desc: '于分布式跟踪和上下文传播的一致、表达性强、与供应商无关的API',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://opentracing.io/',
                repository: 'https://github.com/opentracing',
              },
              {
                name: 'SkyWalking',
                img: '/img/ecology/sky-walking.svg',
                desc: '分布式系统的应用程序性能监视工具',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://skywalking.apache.org/',
                repository: 'https://github.com/apache/skywalking',
              },
              {
                name: 'Zipkin',
                img: '/img/ecology/zipkin.svg',
                desc: 'Zipkin是一个分布式监控系统',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://zipkin.io/',
                repository: 'https://github.com/openzipkin/zipkin',
              },
              {
                name: 'Pinpoint',
                img: '/img/ecology/pinpoint.svg',
                desc: 'Java编写大规模分布式系统的APM（应用性能管理）工具',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://naver.github.io/pinpoint/',
                repository: 'https://github.com/naver/pinpoint',
              },
            ],
          },
          {
            title: '事务',
            children: [
              {
                name: 'Seata',
                img: '/img/ecology/seata.svg',
                desc: 'Seata是一个易于使用、高性能、开源的分布式事务解决方案',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '事务',
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
                img: '/img/ecology/sentinel.svg',
                desc: '轻量级的流量控制、熔断降级 Java 库',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '可靠性',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/alibaba/Sentinel',
                repository: 'https://github.com/alibaba/Sentinel',
              },
              {
                name: 'Hystrix',
                img: '/img/ecology/hystrix.png',
                desc: 'Hystrix是一个延迟和容错库，旨在隔离对远程系统、服务和第三方库的访问点，停止级联故障，并在故障不可避免的复杂分布式系统中实现恢复能力。',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '可靠性',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/Netflix/Hystrix',
                repository: 'https://github.com/Netflix/Hystrix',
              },
              {
                name: 'Resilience4j',
                img: '/img/ecology/resilience4j.png',
                desc: 'resilience4j是一个为java8和函数式编程而设计的容错库。',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '可靠性',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://resilience4j.readme.io/',
                repository: 'https://github.com/resilience4j/resilience4j',
              },
            ]
          },
          {
            title: '授权 (TODO)',
            children: [
              {
                name: 'OAuth',
                img: '/img/ecology/oauth.png',
                desc: '一种开放式协议，允许从Web、移动和桌面应用程序以简单和标准的方法进行安全授权。',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '授权',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://oauth.net/',
                repository: 'https://oauth.net/code/',
              },
            ],
          },
          {
            title: '事件',
            children: [
              {
                name: 'RocketMQ',
                img: '/img/ecology/apache-rocket-mq.svg',
                desc: 'Apache Rocketmq 是一个分布式消息和数据流平台，具有低延迟、高性能和可靠性、万亿级容量和灵活的可扩展性。',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '事件',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://rocketmq.apache.org',
                repository: 'https://github.com/apache/rocketmq',
              },
            ],
          },
          {
            title: 'OpenAPI',
            children: [
              {
                name: 'Swagger',
                img: '/img/ecology/swagger.svg',
                desc: '使用 Swagger 开源代码和专业工具可以简化用户、团队和企业的API开发',
                tags: [
                  {
                    text: '微服务组件',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'OpenAPI',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://swagger.io/',
                repository: 'https://github.com/apache/dubbo-admin',
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
                name: 'Initializr',
                img: '/img/ecology/dubbo.svg',
                desc: '一个 Dubbo + Spring 项目的快速代码生成器 ',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'Bootstrap',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/initializr',
                repository: 'https://github.com/thubbo/initializr',
              }
            ]
          },
          {
            title: '多语言 SDK',
            children: [
              {
                name: 'Java',
                img: '/img/ecology/java.png',
                desc: 'Dubbo Java 客户端',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '多语言 SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Go',
                img: '/img/ecology/go.png',
                desc: 'Apache Dubbo的Go 客户端',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '多语言 SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-go',
                repository: 'https://github.com/apache/dubbo-go',
              },
              {
                name: 'Node.js',
                img: '/img/ecology/nodejs.jpeg',
                desc: 'Dubbo Node.js 客户端',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '多语言 SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-js',
                repository: 'https://github.com/apache/dubbo-js',
              },
              {
                name: 'Python',
                img: '/img/ecology/python.png',
                desc: 'Dubbo python 客户端',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '多语言 SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-python',
                repository: 'https://github.com/apache/dubbo-python',
              },
              {
                name: 'Php',
                img: '/img/ecology/php.jpg',
                desc: 'Dubbo php 客户端',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '多语言 SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-php-framework',
                repository: 'https://github.com/apache/dubbo-php-framework',
              },
              {
                name: 'Erlang',
                img: '/img/ecology/erlang.png',
                desc: 'Dubbo erlang 客户端',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '多语言 SDK',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'http://dubbo.apache.org/zh-cn/docs/user/languages/erlang/start.html',
                repository: 'https://github.com/apache/dubbo-erlang',
              },
            ],
          },
          {
            title: 'API',
            children: [
              {
                name: 'XML',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo XML 配置',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/xml.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Annotation',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo Annotation 配置',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/annotation.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Java',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo 配置的Java API',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://dubbo.apache.org/zh-cn/docs/user/configuration/api.html',
                repository: 'https://github.com/apache/dubbo',
              },
              {
                name: 'Spring Boot',
                img: '/img/ecology/dubbo.svg',
                desc: 'Dubbo Sprng Boot 配置',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: 'API',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/apache/dubbo-spring-boot-project',
                repository: 'https://github.com/apache/dubbo-spring-boot-project',
              },
            ],
          },
          {
            title: '开发者体验',
            children: [
              {
                name: 'IDEA 插件',
                img: '/img/ecology/idea.jpeg',
                desc: '用于Dubbo项目脚手架的Intellij IDEA插件',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '开发者体验',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/intellij-idea-plugin',
                repository: 'https://github.com/thubbo/intellij-idea-plugin',
              },
              {
                name: 'JMeter 插件',
                img: '/img/ecology/jmeter.jpeg',
                desc: 'ApacheJMeter的Dubbo插件，是为测试JMeter中的Dubbo而开发的插件',
                tags: [
                  {
                    text: '开发者体验',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '开发者体验',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://github.com/thubbo/jmeter-plugins-for-apache-dubbo',
                repository: 'https://github.com/thubbo/jmeter-plugins-for-apache-dubbo',
              },
            ],
          },
        ],
      },
      {
        title: '可观测性',
        bgColor: '#00D0D9',
        children: [
          {
            title: '监控',
            children: [
              {
                name: 'Prometheus',
                img: '/img/ecology/prometheus.svg',
                desc: 'Prometheus 监测系统和时间序列数据库',
                tags: [
                  {
                    text: '可观测性',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '监控',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://prometheus.io/',
                repository: 'https://github.com/prometheus/prometheus',
              },
            ],
          },
          {
            title: '追踪',
            children: [
              {
                name: 'OpenTracing (TODO)',
                img: '/img/ecology/opentracing.png',
                desc: '用于分布式跟踪和上下文传播的一致、表达性强、与供应商无关的API',
                tags: [
                  {
                    text: '可观测性',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://opentracing.io/',
                repository: 'https://github.com/opentracing',
              },
              {
                name: 'SkyWalking',
                img: '/img/ecology/sky-walking.svg',
                desc: '分布式系统的应用程序性能监视工具',
                tags: [
                  {
                    text: '可观测性',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://skywalking.apache.org/',
                repository: 'https://github.com/apache/skywalking',
              },
              {
                name: 'Zipkin',
                img: '/img/ecology/zipkin.svg',
                desc: 'Zipkin是一个分布式监控系统',
                tags: [
                  {
                    text: '可观测性',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://zipkin.io/',
                repository: 'https://github.com/openzipkin/zipkin',
              },
              {
                name: 'Pinpoint',
                img: '/img/ecology/pinpoint.svg',
                desc: 'Java编写大规模分布式系统的APM（应用性能管理）工具',
                tags: [
                  {
                    text: '可观测性',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '追踪',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://naver.github.io/pinpoint/',
                repository: 'https://github.com/naver/pinpoint',
              },
            ],
          },
          {
            title: '日志',
            children: [
              {
                name: 'ElasticSearch',
                img: '/img/ecology/elastic.svg',
                desc: '开源、分布式、RESTful的搜索引擎',
                tags: [
                  {
                    text: '可观测性',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '日志',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://www.elastic.co',
                repository: 'https://github.com/elastic/elasticsearch',
              },
            ],
          },
          {
            title: '诊断',
            children: [
              {
                name: 'Arthas',
                img: '/img/ecology/arthas.png',
                desc: 'Alibaba Java诊断利器Arthas',
                tags: [
                  {
                    text: '可观测性',
                    bgColor: '#835BE3',
                  },
                  {
                    text: '诊断',
                    bgColor: '#00D0D9',
                  },
                ],
                website: 'https://alibaba.github.io/arthas/',
                repository: 'https://github.com/alibaba/arthas',
              },
            ],
          },
          {
            title: '混沌工程',
            children: [],
          },
        ],
      },
    ],
  },
};
