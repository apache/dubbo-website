---
aliases:
    - /zh/docsv2.7/user/benchmark-tool/
description: 如何使用基准测试工具包进行压力测试
linkTitle: 基准测试
title: 基准测试工具包
type: docs
weight: 18
---



* 下载源码： git clone https://github.com/apache/dubbo.git  
* 编译benchmark: cd dubbo/dubbo-test/dubbo-test-benchmark; mvn clean install  
* 解压 benchmark压缩包： dubbo/dubbo-test/dubbo-test-benchmark/target/dubbo-test-benchmark-2.6.2-SNAPSHOT.tar.gz 

阅读ReadMe.txt（内容如下，请以压缩包内的为准）

* 新建一个benchmark工程，如demo.benchmark
* 导入自己服务的接口api包和dubbo.benchmark.jar(解压dubbo.benchmark.tar.gz，在lib目录下)
* 新建一个类，实现AbstractClientRunnable

    * 实现父类的构造函数
    * 实现invoke方法，通过serviceFactory创建本地接口代理，并实现自己的业务逻辑，如下

    ```java
    public Object invoke(ServiceFactory serviceFactory) {
      DemoService demoService = (DemoService) serviceFactory.get(DemoService.class);
      return demoService.sendRequest("hello");
    }
    ```
* 将自己的benchmark工程打成jar包,如demo.benchmark.jar
* 将demo.benchmark.jar 和服务的api包放到dubbo.benchmark/lib目录下
* 配置dubbo.properties
* 运行run.bat(windows)或run.sh(linux)

如想测试dubbo的不同版本，直接替换lib下的dubbo的jar包即可。