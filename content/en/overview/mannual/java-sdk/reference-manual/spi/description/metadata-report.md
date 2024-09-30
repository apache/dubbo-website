---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/metadata-report/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/metadata-report/
description: Metadata Center Extension
linkTitle: Metadata Center Extension
title: Metadata Center Extension
type: docs
weight: 13
---






## Design Purpose
Please refer to the [Metadata Center Manual](../../../metadata-center/overview/)

## Extension Interfaces

* `org.apache.dubbo.metadata.store.MetadataReportFactory`
* `org.apache.dubbo.metadata.store.MetadataReport`

## Known Extensions

## Implementation Principles

### SPI Definition

Reference: org.apache.dubbo.metadata.store.MetadataReportFactory, org.apache.dubbo.metadata.store.MetadataReport

```java
@SPI("redis")
public interface MetadataReportFactory {
    @Adaptive({"protocol"})
    MetadataReport getMetadataReport(URL url);
}
```



### Custom Metadata Storage

The following example describes the Redis storage.

Create a new project that needs to support the following modifications:

#### Extend AbstractMetadataReport

```java
public class RedisMetadataReport extends AbstractMetadataReport {
    private final static Logger logger = LoggerFactory.getLogger(RedisMetadataReport.class);
    final JedisPool pool;

    public RedisMetadataReport(URL url) {
        super(url);
        pool = new JedisPool(new JedisPoolConfig(), url.getHost(), url.getPort());
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
        try (Jedis jedis = pool.getResource()) {
            jedis.set(metadataIdentifier.getIdentifierKey() + META_DATA_SOTRE_TAG, v);
        } catch (Throwable e) {
            logger.error("Failed to put " + metadataIdentifier + " to redis " + v + ", cause: " + e.getMessage(), e);
            throw new RpcException("Failed to put " + metadataIdentifier + " to redis " + v + ", cause: " + e.getMessage(), e);
        }
    }
}
```

#### Extend AbstractMetadataReportFactory

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

Just package the above modifications and the project into a jar file, then configure the metadata center's URL: redis://10.20.153.10:6379.

Thus, a custom metadata storage can now run.

