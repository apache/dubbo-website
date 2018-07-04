# 注解配置

需要 `2.5.7` 及以上版本支持  

## 服务提供方

### `Service`注解暴露服务

```java
import com.alibaba.dubbo.config.annotation.Service;
 
@Service(timeout = 5000)
public class AnnotateServiceImpl implements AnnotateService { 
    // ...
}
```
    
### javaconfig形式配置公共模块

```java
@Configuration
public class DubboConfiguration {

    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("provider-test");
        return applicationConfig;
    }

    @Bean
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("zookeeper://127.0.0.1:2181");
        registryConfig.setClient("curator");
        return registryConfig;
    }
}
```

### 指定dubbo扫描路径

```java
@SpringBootApplication
@DubboComponentScan(basePackages = "com.alibaba.dubbo.test.service.impl")
public class ProviderTestApp {
    // ...
}
```


## 服务消费方

### `Reference`注解引用服务

```java
public class AnnotationConsumeService {

    @com.alibaba.dubbo.config.annotation.Reference
    public AnnotateService annotateService;
    
    // ...
}

```

    
### javaconfig形式配置公共模块

```java
@Configuration
public class DubboConfiguration {

    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("consumer-test");
        return applicationConfig;
    }

    @Bean
    public ConsumerConfig consumerConfig() {
        ConsumerConfig consumerConfig = new ConsumerConfig();
        consumerConfig.setTimeout(3000);
        return consumerConfig;
    }

    @Bean
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("zookeeper://127.0.0.1:2181");
        registryConfig.setClient("curator");
        return registryConfig;
    }
}
```

### 指定dubbo扫描路径

```java
@SpringBootApplication
@DubboComponentScan(basePackages = "com.alibaba.dubbo.test.service")
public class ConsumerTestApp {
    // ...
}
``` 

## 注意

如果你曾使用旧版annotation配置，请删除所有相关配置，我们将在下个版本删除所有旧版配置项。

```xml
<dubbo:annotation package="com.alibaba.dubbo.test.service" /> 
```


