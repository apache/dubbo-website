---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/spi/description/metadata-report/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/spi/description/metadata-report/
description: 元数据中心扩展
linkTitle: 元数据中心扩展
title: 元数据中心扩展
type: docs
weight: 13
---






## 设计目的
请参见 [元数据中心手册](../../../metadata-center/overview/)

## 扩展接口

* `org.apache.dubbo.metadata.store.MetadataReportFactory`
* `org.apache.dubbo.metadata.store.MetadataReport`

## 已知扩展

## 实现原理

### SPI定义

参考：org.apache.dubbo.metadata.store.MetadataReportFactory，org.apache.dubbo.metadata.store.MetadataReport

```java
@SPI("redis")
public interface MetadataReportFactory {
    @Adaptive({"protocol"})
    MetadataReport getMetadataReport(URL url);
}
```



### 自定义元数据的存储

下面以Redis存储为例进行说明。

新建一个project，需要支持以下修改：

#### 扩展AbstractMetadataReport

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

#### 扩展 AbstractMetadataReportFactory

```java
public class RedisMetadataReportFactory extends AbstractMetadataReportFactory {
    @Override
    public MetadataReport createMetadataReport(URL url) {
        return new RedisMetadataReport(url);
    }
}
```

#### 增加 MetadataReportFactory

> META-INF/dubbo/internal/org.apache.dubbo.metadata.store.MetadataReportFactory

```properties
redis=org.apache.dubbo.metadata.store.redis.RedisMetadataReportFactory
```

只要将上面的修改和project打包成jar包，然后配置元数据中心的url：redis://10.20.153.10:6379。

至此，一个自定义的元数据存储就可以运行了。