# Local call

The local call uses the `injvm` protocol, a pseudo-protocol that does not turn on the port, does not initiate remote calls, is directly associated within the JVM, but executes the Dubbo Filter chain.

## Configuration

Configure `injvm` protocol

```xml
<dubbo:protocol name="injvm" />
```

Configure default provider

```xml
<dubbo:provider protocol="injvm" />
```

Configure default service

```xml
<dubbo:service protocol="injvm" />
```

Use injvm first

```xml
<dubbo:consumer injvm="true" .../>
<dubbo:provider injvm="true" .../>
```

or

```xml
<dubbo:reference injvm="true" .../>
<dubbo:service injvm="true" .../>
```

Note: Both service provider and service references need to declare `injvm="true"`

## Automatically exposed, local service references

`2.2.0` or later, each service is exposed locally by default. When referring to the service, the local service is referenced by default. If you want to reference a remote service, you can use the following configuration to force a reference to a remote service.


```xml
<dubbo:reference ... scope="remote" />
```
