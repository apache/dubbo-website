# DNS Registry

DNS registry relies on DNS for service discovery, and uses DNS resolution to perform application-level service discovery for provider nodes based on the Service Discovery Model. Current DNS registry is developed for Kubernetes Headless Service, which theoretically supports all DNS services.

## Dependency

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-registry-dns</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```
Since Kubernetes does not provide the alility as a config center, it is necessary to introduce a config center to support the service name mapping of Service Introspection.

## Configuration

In order to enable DNS Registry, the following configurations are required.

```bash
dubbo.application.metadataServicePort=20885
dubbo.registry.address=dns://${your kube dns ip here}:53?registry-type=service&duplicate=false&addressSuffix=.dubbo-demo.svc.cluster.local.
dubbo.metadata-report.address=${your metadata-report address here, can be the same with config-center}
dubbo.config-center.address=${your config-center address here}
```

Configuration description：

- dubbo.application.metadataServicePort: Service Discovery MetadataService provider port, all applications using the DNS registry need to be configured, and the port number must be consistent
- dubbo.registry.address: Registry address, see the following text for specific parameters
- dubbo.metadata-report.address: Metadata report center address, used to upload metadata information
- dubbo.config-center.address: Configuration center address, used to upload service configuration information


Properties for registry description：


| property name | required | default value | description |
| :---: | :---: | :---: | :---: |
| protocol | yes | dns | the protocol for registry |
| ip | yes | - | DNS Server IP |
| port | yes | 53 | DNS port（UDP protocol） |
| registry-type | yes | service | enable Service Discovery |
| duplicate | yes | false | enable interface level register（DNS Registry not support） |
| addressPrefix | no | - | domain address prefix |
| addressSuffix | no | .dubbo-demo.svc.cluster.local. | domain address suffix |
| maxQueriesPerResolve | no | 10 | DNS queries per resolve |
| pollingCycle | no | 5000 | DNS polling cycle for address update（Unit: milliseconds） |
| echoPollingCycle | no | 60000 | polling cycle for endpoints echo（Unit: milliseconds） |
| scheduledThreadPoolSize | no | 1 | polling thread pool size |

## Note

- Kubernetes Service Name should consistent with Dubbo application name.
- Dubbo Kubernetes Registry itself does not strongly rely on the Kubernetes Service port, but if you want to cooperate with Spring Cloud, it is recommended that the port number be consistent with the port number of the interface protocol.
