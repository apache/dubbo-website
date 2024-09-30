---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/governance/health/start-check/
    - /en/docs3-v2/golang-sdk/tutorial/governance/health/start-check/
    - /en/overview/mannual/golang-sdk/tutorial/governance/health/start-check/
description: "By default, the framework checks the availability of dependent services (whether the registry has available addresses) at startup. If not available, it throws an exception to prevent the application from finishing initialization, allowing issues to be discovered early during deployment. The default is check=\"true\" and waits for 3 seconds."
keywords: Startup check
title: Startup check
type: docs
weight: 4
---

The Dubbo framework, by default, checks the availability of dependent services at startup (whether the registry has available addresses). If not available, it throws an exception to prevent the application from completing initialization, allowing early detection of problems during deployment. The default is check="true" and waits for 3 seconds.

You can disable the check with check="false". For example, during testing, some services may not be of concern, or there may be circular dependencies, requiring one party to start first.

After disabling check, please note that when there are many providers, the consumer subscribing to the provider and generating service addresses may have some delay. If the consumer starts providing services immediately, it may cause a "cold start". Therefore, at this time, please preheat the services.

Example:

```yaml
dubbo:
  consumer:
    check : false
    reference: 
      myservice:
       check: true 
```

Or

```go
cli, err := client.NewClient(
	client.WithClientCheck(false),
)
```

Or

```go
svc, err := health.NewHealth(cli)
svc.Check(context.Background(), &health.HealthCheckRequest{Service: "greet.GreetService"}, client.WithCheck(false))
```

