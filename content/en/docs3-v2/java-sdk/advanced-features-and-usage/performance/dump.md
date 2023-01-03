---
type: docs
title: "Export thread stack"
linkTitle: "Export thread stack"
weight: 43
description: "Automatically export thread stack in Dubbo to preserve the field"
---
## Feature description
Dubbo automatically exports the thread stack through Jstack to keep the scene, which is convenient for troubleshooting.

default policy

* Export path: the user's home directory identified by user.home
* Export Interval: The shortest interval allows an export every 10 minutes
* Export switch: open by default

## scenes to be used
When the business thread pool is full, we need to know which resources and conditions the threads are waiting for in order to find the bottleneck or abnormal point of the system.

## How to use
### Export switch control
```properties
# dubbo.properties
dubbo.application.dump.enable=true
```
```xml
<dubbo:application name="demo-provider" dump-enable="false"/>
```

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
    dump-enable: false
```



### Specify the export path

```properties
# dubbo.properties
dubbo.application.dump.directory=/tmp
```

```xml
<dubbo:application name="demo-provider" dump-directory="/tmp"/>
```

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
    dump-directory: /tmp
```