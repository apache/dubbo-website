# Annotation Configuration

 Requires`2.5.7` or higher

## Provider Side

### `Service` annotation for exporting

```java
import com.alibaba.dubbo.config.annotation.Service;
 
@Service(timeout = 5000)
public class AnnotateServiceImpl implements AnnotateService { 
    // ...
}
```
    
### Use JavaConfig for common parts

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

### Path to scan

```java
@SpringBootApplication
@DubboComponentScan(basePackages = "com.alibaba.dubbo.test.service.impl")
public class ProviderTestApp {
    // ...
}
```


## Consumer Side

### `Reference` annotation for reference

```java
public class AnnotationConsumeService {

    @com.alibaba.dubbo.config.annotation.Reference
    public AnnotateService annotateService;
    
    // ...
}

```

    
### Use JavaConfig for common parts

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

### Path to scan

```java
@SpringBootApplication
@DubboComponentScan(basePackages = "com.alibaba.dubbo.test.service")
public class ConsumerTestApp {
    // ...
}
``` 

## NOTES

All annotations in 2.5.7 will be removed later, if you have used these annotations in your project, please upgrade to the latest version.

```xml
<dubbo:annotation package="com.alibaba.dubbo.test.service" /> 
```


