---
type: docs
title: "Netty4"
linkTitle: "Netty4"
weight: 44
description: "Config netty4 support in dubbo"
---

Add support for netty4 communication module in 2.5.6 version of dubbo, enabled as follows:

provider：
```xml
<dubbo:protocol server="netty4" />
```

or

```xml
<dubbo:provider server="netty4" />
```

consumer：
```xml
<dubbo:consumer client="netty4" />

```

{{% alert title="Warning" color="warning" %}}
1. If provider need to use different communication layer framework for different protocols , please configure multiple protocols separately.
2. consumer configuration as follow：
    ```xml
    <dubbo:consumer client="netty">
        <dubbo:reference />
    </dubbo:consumer>
    ```
   
    ```xml
    <dubbo:consumer client="netty4">
        <dubbo:reference />
    </dubbo:consumer>
    ```

Next we will continue to do something：We will provide a reference data on the performance test indicators and performance test comparison with the version of netty 3.
{{% /alert %}}

