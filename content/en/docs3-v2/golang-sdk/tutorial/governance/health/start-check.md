---
title: dubbogo 3.0 check at startup
keywords: check when dubbogo 3.0 starts
description: Check when dubbogo 3.0 starts
weight: 4
type: docs
---

# check at startup

Check if dependent services are available at startup

By default, Dubbo-go will check whether the dependent services are available at startup. When they are not available, an exception will be thrown to prevent the application from completing initialization, so that problems can be detected early when going online. The default check="true" and wait for 3s.

You can turn off the check with check="false". For example, when testing, some services don't care, or there is a circular dependency, and one of them must be started first.

After closing check, please note that when the number of providers is large, there may be a certain delay when the consumer subscribes to the provider to generate the service dictionary. If the consumer provides services to the outside world as soon as it starts,
May cause "cold start". So at this time, please warm up the service.

Example:

```yaml
dubbo:
  consumer:
    check: false
    reference:
      myserivce:
       check: true
```