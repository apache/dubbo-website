# 配置方式总结

我们这篇文章主要讲在**应用启动阶段，Dubbo框架如何将所需要的配置采集起来**（包括应用配置、注册中心配置、服务配置等），以完成服务的暴露和引用流程。

根据驱动方式的不同（比如Spring或裸API编程）配置形式上肯定会有所差异，这个我们接下来会对每种方式分别展开介绍。除了外围驱动方式上的差异，Dubbo的配置读取总体上遵循了以下几个原则：

1. Dubbo支持了多层级的配置，并预定按优先级自动实现配置间的覆盖，最终被汇总到数据总线URL驱动后续的服务暴露、引用等流程。
2. ApplicationConfig、ServiceConfig、ReferenceConfig可以被理解成配置来源的一种，是直接面向用户编程的配置采集方式。
3. 配置格式以Properties为主，在key的命名上有一套自己的[规范]()



## 配置来源

首先，从Dubbo支持的配置来源说起，默认有四种配置来源：

- JVM System Properties，-D参数
- Externalized Configuration，外部化配置
- ServiceConfig、ReferenceConfig等编程接口采集的配置
- 本地配置文件dubbo.properties

### 覆盖关系

下图展示了配置覆盖关系的优先级，从上到下优先级依次降低：

![覆盖关系](/Users/ken.lj/Documents/Dubbo核心演进/2.7相关文档/用户文档/覆盖关系.jpg)



### 外部化配置

外部化配置即Config Center是2.7.0中新引入的一种配置源，目的是能实现配置的集中式管理，对于配置集中管理业界已经有很多成熟的专业配置系统如Apollo, Nacos等，Dubbo所做的只是保证能配合这些系统正常工作。

2.7.0版本开始支持`Zookeeper`、`Apollo`两种配置存储。

以Zookeeper为例，外部化配置就是存储在`/dubbo/config/dubbo/dubbo.properties`路径下的`.properties`文件：

```properties
# 将注册中心地址、元数据中心地址等配置集中管理，可以做到统一环境、减少开发侧感知。
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.simplified=true

dubbo.metadataReport.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=20880

dubbo.application.qos.port=33333
```



所谓Dubbo对这些配置中心的支持，本质上就是把`.properties`从远程拉取到本地，然后和本地的配置做一次融合。所以理论上只要Dubbo框架能拿到需要的配置就可以正常的工作，所以Dubbo还提供了以下API，让用户将自己组织好的配置塞给Dubbo框架（至于配置从哪里来是用户要完成的事情），这样Dubbo框架就不再直接和Apollo或Zookeeper做读取配置交互。

```java
Map<String, String> dubboConfigurations = new HashMap<>();
dubboConfigurations.put("dubbo.registry.address", "zookeeper://127.0.0.1:2181");
dubboConfigurations.put("dubbo.registry.simplified", "true");

ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setExternalConfig(dubboConfigurations);
```



## 配置格式

目前Dubbo支持的所有配置都是`.properties`格式的，包括`-D`、`Externalized Configuration`等，`.properties`中的所有配置项遵循一种`path-based`的配置格式：

```properties
# 应用级别
dubbo.{config-type}[.{config-id}].{config-item}={config-item-value}
# 服务级别
dubbo.service.{interface-name}[.{method-name}].{config-item}={config-item-value}
dubbo.reference.{interface-name}[.{method-name}].{config-item}={config-item-value}
# 多配置项
dubbo.{config-type}s.{config-id}.{config-item}={config-item-value}
```

- 应用级别

```properties
dubbo.application.name=demo-provider
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.protocol.port=-1
```

- 服务级别

```properties
dubbo.service.org.apache.dubbo.samples.api.DemoService.timeout=5000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.tineout=6000
dubbo.reference.org.apache.dubbo.samples.api.DemoService.sayHello.timeout=7000
```

- 多配置项

```properties
dubbo.registries.unit1.address=zookeeper://127.0.0.1:2181
dubbo.registries.unit2.address=zookeeper://127.0.0.1:2182

dubbo.protocols.dubbo.name=dubbo
dubbo.protocols.dubbo.port=20880
dubbo.protocols.hessian.name=hessian
dubbo.protocols.hessian.port=8089
```



## 几种编程配置方式

接下来，我们看一下选择不同的开发方式时，对应到`ServiceConfig、ReferenceConfig等编程接口采集的配置`的变化。

### Spring

- XML

参见[示例](https://github.com/apache/incubator-dubbo-samples/tree/master/dubbo-samples-basic)

```xml
  <!-- dubbo-provier.xml -->
  
  <dubbo:application name="demo-provider"/>
  <dubbo:conig-center address="zookeeper://127.0.0.1:2181"/>
  
  <dubbo:registry address="zookeeper://127.0.0.1:2181" simplified="true"/>
  <dubbo:metadata-report address="redis://127.0.0.1:6379"/>
  <dubbo:protocol name="dubbo" port="20880"/>
  
  <bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>
  <dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>
 ```



- Annotation

参见[示例](https://github.com/apache/incubator-dubbo-samples/tree/master/dubbo-samples-annotation)

```java
  // AnnotationService服务实现
  
  @Service
  public class AnnotationServiceImpl implements AnnotationService {
      @Override
      public String sayHello(String name) {
          System.out.println("async provider received: " + name);
          return "annotation: hello, " + name;
      }
  }
 ```

```properties
  ## dubbo.properties
  
  dubbo.application.name=annotation-provider
  dubbo.registry.address=zookeeper://127.0.0.1:2181
  dubbo.protocol.name=dubbo
  dubbo.protocol.port=20880
```



- Spring Boot

参见[示例](https://github.com/apache/incubator-dubbo-spring-boot-project/tree/master/dubbo-spring-boot-samples)

```properties
  ## application.properties
  
  # Spring boot application
  spring.application.name=dubbo-externalized-configuration-provider-sample
  
  # Base packages to scan Dubbo Component: @com.alibaba.dubbo.config.annotation.Service
  dubbo.scan.base-packages=com.alibaba.boot.dubbo.demo.provider.service
  
  # Dubbo Application
  ## The default value of dubbo.application.name is ${spring.application.name}
  ## dubbo.application.name=${spring.application.name}
  
  # Dubbo Protocol
  dubbo.protocol.name=dubbo
  dubbo.protocol.port=12345
  
  ## Dubbo Registry
  dubbo.registry.address=N/A
  
  ## DemoService version
  demo.service.version=1.0.0
```



### API

```java
public static void main(String[] args) throws IOException {
    ServiceConfig<GreetingsService> service = new ServiceConfig<>();
    service.setApplication(new ApplicationConfig("first-dubbo-provider"));
    service.setRegistry(new RegistryConfig("multicast://224.5.6.7:1234"));
    service.setInterface(GreetingsService.class);
    service.setRef(new GreetingsServiceImpl());
    service.export();
    System.out.println("first-dubbo-provider is running.");
    System.in.read();
}
```

参考[示例