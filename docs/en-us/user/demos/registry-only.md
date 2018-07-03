# Register only

You have two mirroring environments, two registries. 
You have deployed one service at only one of the registries, another registries have not had time to deploy, and other applications at both registries need to rely on the service. 
At this time, the service provider registers service to another registrar, but the service consumers do not consume the service from another registrar.

Disable subscription configuration

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090" subscribe="false" />
```

or

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090?subscribe=false" />
```
