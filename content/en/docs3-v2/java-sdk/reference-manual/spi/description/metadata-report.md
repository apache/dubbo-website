---
type: docs
title: "Metadata Center Extension"
linkTitle: "Metadata Center Extension"
weight: 13
---

## aim of design
See the [Metadata Center Manual](../../../metadata-center/overview/)

## Extension ports

* `org.apache.dubbo.metadata.store.MetadataReportFactory`
* `org.apache.dubbo.metadata.store.MetadataReport`

## Known extensions

## Implementation principle

### SPI definition

Reference: org.apache.dubbo.metadata.store.MetadataReportFactory, org.apache.dubbo.metadata.store.MetadataReport

```java
@SPI("redis")
public interface MetadataReportFactory {
    @Adaptive({"protocol"})
    MetadataReport getMetadataReport(URL url);
}
```



### Custom metadata storage

The following uses Redis storage as an example for illustration.

To create a new project, you need to support the following modifications:

#### Extend AbstractMetadataReport

```java
public class RedisMetadataReport extends AbstractMetadataReport {
    private final static Logger logger = LoggerFactory. getLogger(RedisMetadataReport. class);
    final JedisPool pool;

    public RedisMetadataReport(URL url) {
        super(url);
        pool = new JedisPool(new JedisPoolConfig(), url. getHost(), url. getPort());
    }
    @Override
    protected void doStoreProviderMetadata(ProviderMetadataIdentifier providerMetadataIdentifier, String serviceDefinitions) {
        this.storeMetadata(providerMetadataIdentifier, serviceDefinitions);
    }
    @Override
    protected void doStoreConsumerMetadata(ConsumerMetadataIdentifier consumerMetadataIdentifier, String value) {
        this.storeMetadata(consumerMetadataIdentifier, value);
    }
    private void storeMetadata(MetadataIdentifier metadataIdentifier, String v) {
        try (Jedis jedis = pool. getResource()) {
            jedis.set(metadataIdentifier.getIdentifierKey() + META_DATA_SOTRE_TAG, v);
        } catch (Throwable e) {
            logger.error("Failed to put " + metadataIdentifier + " to redis " + v + ", cause: " + e.getMessage(), e);
            throw new RpcException("Failed to put " + metadataIdentifier + " to redis " + v + ", cause: " + e.getMessage(), e);
        }
    }
}
```

#### Extends AbstractMetadataReportFactory

```java
public class RedisMetadataReportFactory extends AbstractMetadataReportFactory {
    @Override
    public MetadataReport createMetadataReport(URL url) {
        return new RedisMetadataReport(url);
    }
}
```

#### Add MetadataReportFactory

> META-INF/dubbo/internal/org.apache.dubbo.metadata.store.MetadataReportFactory

```properties
redis=org.apache.dubbo.metadata.store.redis.RedisMetadataReportFactory
```

Just pack the above modification and project into a jar package, and then configure the url of the metadata center: redis://10.20.153.10:6379.

At this point, a custom metadata store is ready to run.