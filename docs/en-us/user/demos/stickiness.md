# stickiness

Sticky connections are used for stateful services, as much as possible so that clients always make calls to the same provider, unless the provider hangs up and connects to the other one.

Sticky connections will automatically open [Delayed Connections](./lazy-connect.md) to reduce the number of long connections.

```xml
<dubbo:protocol name="dubbo" sticky="true" />
```

