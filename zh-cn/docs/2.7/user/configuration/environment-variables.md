# 自动加载环境变量

从2.7.3版本开始，Dubbo会自动从约定key中读取配置，并将配置以Key-Value的形式写入到URL中。

支持的key有以下两个：

1. `dubbo.labels`，指定一些列配置到URL中的键值对，通常通过JVM -D或系统环境变量指定。

    增加以下配置：
    
    ```properties
    # JVM
    -Ddubbo.labels = "tag1=value1; tag2=value2"
 
    # 环境变量
    DUBBO_LABELS = "tag1=value1; tag2=value2"
    ```
    最终生成的URL会包含 tag1、tag2 两个 key: `dubbo://xxx?tag1=value1&tag2=value2`
    
    
2. `dubbo.env.keys`，指定环境变量key值，Dubbo会尝试从环境变量加载每个 key

    ```properties
    # JVM
    -Ddubbo.env.keys = "DUBBO_TAG1, DUBBO_TAG2"

    # 环境变量
    DUBBO_ENV_KEYS = "DUBBO_TAG1, DUBBO_TAG2"
    ```
    
    最终生成的URL会包含 DUBBO_TAG1、DUBBO_TAG2 两个 key: `dubbo://xxx?DUBBO_TAG1=value1&DUBBO_TAG2=value2`