---
type: docs
title: "Annotation Configuration"
linkTitle: "Annotation"
weight: 4
description: "Configure Dubbo with annotation"
---

{{% pageinfo %}}
 Requires`2.6.3` or higher, click here to view the [complete sample](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-annotation)
{{% /pageinfo %}}


## Provider Side
k
### `@DubboService` annotation for exporting

```java
@DubboService
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayHello(String name) {
        return "annotation: hello, " + name;
    }
}
```
    
### Add application sharing configuration

```properties
# dubbo-provider.properties
dubbo.application.name=annotation-provider
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
```

### Spring scan path

```java
@Configuration
@EnableDubbo(scanBasePackages = "org.apache.dubbo.samples.simple.annotation.impl")
@PropertySource("classpath:/spring/dubbo-provider.properties")
static public class ProviderConfiguration {
       
}
```

## Consumer Side

### `@Reference` annotation for reference

```java
@Component("annotationAction")
public class AnnotationAction {

    @Reference
    private AnnotationService annotationService;
    
    public String doSayHello(String name) {
        return annotationService.sayHello(name);
    }
}
```

### Add application sharing configuration

```
# dubbo-consumer.properties
dubbo.application.name=annotation-consumer
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.consumer.timeout=3000
```

### Spring scan path

```java
@Configuration
@EnableDubbo(scanBasePackages = "org.apache.dubbo.samples.simple.annotation.action")
@PropertySource("classpath:/spring/dubbo-consumer.properties")
@ComponentScan(value = {"org.apache.dubbo.samples.simple.annotation.action"})
static public class ConsumerConfiguration {

}
``` 

### Invoke service

```java
public static void main(String[] args) throws Exception {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ConsumerConfiguration.class);
    context.start();
    final AnnotationAction annotationAction = (AnnotationAction) context.getBean("annotationAction");
    String hello = annotationAction.doSayHello("world");
}
```
