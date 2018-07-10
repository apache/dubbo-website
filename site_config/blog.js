export default {
  'en-us': {
    barText: 'Blog',
    postsTitle: 'All posts',
    list: [
      {
        title: 'The first Dubbo meetup has been held in Beijing',
        author: 'Huxing Zhang',
        dateStr: 'May 12nd，2018',
        desc: 'The first Dubbo meetup has successfully been held in Beijing, over 400+ people were present. What a great event! ',
        link: '/blog/dubbo-meetup-beijing-may-12th-2018.md',
      },
      {
        title: 'The ApacheCon NA schedule has been announced',
        author: 'Huxing Zhang',
        dateStr: 'May 2nd，2018',
        desc: 'Ian Luo and Jun Liu will talk about "Introducing Apache Dubbo(Incubating): What is Dubbo and How it Works" at ApacheCon NA this year in Montréal!',
        link: '/blog/apachecon-na-2018.md',
      },
      {
        title: 'The GSoC (Google Summer of Code) 2018 projects has been announced',
        author: 'Huxing Zhang',
        dateStr: 'April 25th，2018',
        desc: 'Raghu Reddy\'s project "Extending Serialization protocols support for Apache Dubbo" has been accepted! Congratulations!',
        link: '/blog/gsoc-2018.md',
      },
      {
        title: 'Dubbo roadmap is announced in QCon Beijing 2018',
        author: 'Huxing Zhang',
        dateStr: 'April 22nd，2018',
        desc: 'Ian Luo has delivered a great talk at QCon Beijing 2018, where the roadmap of Dubbo has also be announced',
        link: '/blog/qcon-beijing-2018.md',
      },
    ]
  },
  'zh-cn': {
    barText: '博客',
    postsTitle: '所有文章',
    list: [
      {
        title: 'Dubbo 的同步与异步调用方式',
        author: '@Jerrick Zhu',
        dateStr: 'July 10th, 2018',
        desc: '主要讲述了 Dubbo 在底层异步通信机制的基础上实现的同步调用、异步调用、参数回调以及事件通知几种方式及示例。',
        link: '/blog/dubbo-invoke.md',
      },
      {
        title: '第一个 Dubbo 应用',
        author: '@beiwei30',
        dateStr: 'June 2nd, 2018',
        desc: '现代的分布式服务框架的基本概念与 RMI 是类似的，同样是使用 Java 的 Interface 作为服务契约，通过注册中心来完成服务的注册和发现，远程通讯的细节也是通过代理类来屏蔽。',
        link: '/blog/dubbo-101.md',
      },
      {
        title: 'Dubbo基本用法-Dubbo Provider配置',
        author: '@cvictory',
        dateStr: 'June 1st, 2018',
        desc: '主要讲述如何配置dubbo，按照配置方式上分，可以分为：XML配置，properties方式配置，注解方式配置，API调用方式配置。',
        link: '/blog/dubbo-basic-usage-dubbo-provider-configuration.md',
      },
      {
        title: 'Spring Boot+Dubbo应用启停源码分析',
        author: 'Huxing Zhang',
        dateStr: 'May 28th, 2018',
        desc: 'dubbo-spring-boot-project致力于简化 Dubbo RPC 框架在Spring Boot应用场景的开发，同时也整合了Spring Boot特性。',
        link: '/blog/spring-boot-dubbo-start-stop-analysis.md',
      },
      {
        title: '优化技巧：提前if判断帮助CPU分支预测',
        author: '@hengyunabc',
        dateStr: 'May 20th, 2018',
        desc: '要提高代码执行效率，一个重要的原则就是尽量避免CPU把流水线清空，那么提高分支预测的成功率就非常重要。那么对于代码里，如果某个switch分支概率很高，是否可以考虑代码层面帮CPU把判断提前，来提高代码执行效率呢？',
        link: '/blog/optimization-branch-prediction.md',
      },
      {
        title: 'Dubbo可扩展机制实战',
        author: '@vangoleo',
        dateStr: 'May 10th, 2018',
        desc: '在谈到软件设计时，可扩展性一直被谈起，那到底什么才是可扩展性，什么样的框架才算有良好的可扩展性呢？',
        link: '/blog/introduction-to-dubbo-spi.md',
      },
      {
        title: 'Dubbo可扩展机制源码解析',
        author: '@hengyunabc',
        dateStr: 'May 10th, 2018',
        desc: '在前面的博客中，我们了解了Dubbo扩展机制的一些概念，初探了Dubbo中LoadBalance的实现，并自己实现了一个LoadBalance。接下来，我们就深入Dubbo的源码，一睹庐山真面目。',
        link: '/blog/introduction-to-dubbo-spi-2.md',
      },
    ]
  },
};
