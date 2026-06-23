---
description: "Explains application-level service discovery in dubbo-go, including registry data, metadata modes, and default metadata service settings."
title: Application-level Service Discovery
type: docs
weight: 12
---

Dubbo-go supports both interface-level registration and application-level service discovery. Interface-level registration stores callable provider URLs directly in the registry. Application-level service discovery stores application instances in the registry, and uses service mapping plus metadata to recover the provider URLs required by consumers.

Application-level service discovery is the current default model. Interface-level registration and application-level service discovery use different registration and subscription paths, and they are not automatically interoperable. A consumer using interface-level discovery cannot discover providers that only register application-level instances; a consumer using application-level discovery cannot discover providers that only register interface-level URLs. Use `all` during migration if both consumer types must be supported.

## Registration Modes

Use the registry type to choose how a provider registers itself:

| Registry type | API option | What is registered |
| --- | --- | --- |
| `interface` | `registry.WithRegisterInterface()` | Provider URLs such as `tri://host:port/interface` or `rest://host:port/interface`. |
| `service` | `registry.WithRegisterService()` | Application instances and instance metadata. Consumers discover instances first, then resolve provider URLs from metadata. |
| `all` | `registry.WithRegisterServiceAndInterface()` | Both application-level instances and interface-level provider URLs. This is useful during migration. |

Example:

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
		registry.WithRegisterService(),
	),
)
```

When using configuration files, set `registry-type` to `service`, `interface`, or `all`. Use an explicit value if you need deterministic registration behavior.

## What the Registry Stores

In application-level service discovery, the registry does not store the complete callable provider URL as the primary registration data. It stores application-level data, including:

- application name;
- instance host and port;
- instance metadata;
- exported services revision;
- metadata storage type;
- metadata service URL parameters;
- service-to-application mapping.

The consumer first finds which applications provide a service, then subscribes to those application instances. After that, it uses metadata to recover service-level provider URLs.

## Metadata Modes

Application-level discovery needs provider metadata. Dubbo-go supports two metadata storage modes.

### Local Metadata

`local` is the default metadata mode.

In local metadata mode, the provider keeps `MetadataInfo` locally and exposes a metadata service. The provider registers the instance revision and metadata service URL parameters into the registry. The consumer reads these parameters from the provider instance and calls the provider metadata service to fetch `MetadataInfo`.

Flow:

```text
provider -> registry: application instance + revision + metadata service URL params
consumer -> registry: discover provider instance
consumer -> provider metadata service: get MetadataInfo by revision
```

The metadata service RPC protocol is controlled by `metadata-service-protocol`. The current default is `dubbo`, and it can be configured explicitly:

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithMetadataServiceProtocol("tri"),
)
```

The provider and consumer do not need to configure the same `metadata-service-protocol` value. The provider records the metadata service protocol in instance metadata, and the consumer uses that advertised protocol to call the provider metadata service. The consumer runtime must support the protocol advertised by the provider.

### Remote Metadata

In remote metadata mode, the provider reports `MetadataInfo` to a metadata center through metadata report. The consumer reads metadata from the metadata center instead of calling the provider metadata service.

Flow:

```text
provider -> metadata center: report MetadataInfo
provider -> registry: application instance + revision
consumer -> registry: discover provider instance
consumer -> metadata center: read MetadataInfo by revision
```

Enable remote metadata with `dubbo.WithRemoteMetadata()` and configure a metadata report:

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithRemoteMetadata(),
	dubbo.WithMetadataReport(
		metadata.WithProtocol("nacos"),
		metadata.WithAddress("127.0.0.1:8848"),
	),
)
```

The registry can also be reused as the metadata report center. Registry configuration uses `use-as-meta-report=true` by default, unless `registry.WithoutUseAsMetaReport()` is set.

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("demo-provider"),
	dubbo.WithRemoteMetadata(),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
		registry.WithRegisterService(),
	),
)
```

In remote metadata mode, both providers and consumers must be able to access the same metadata center. `metadata-service-protocol` does not affect remote metadata because the consumer does not call the provider metadata service.

## Current Defaults

| Item | Current default |
| --- | --- |
| `metadata-type` | `local` |
| `metadata-service-protocol` | `dubbo` |
| registry `use-as-meta-report` | `true` |
| registry `use-as-config-center` | `true` |
| default registration and discovery model | application-level service discovery, `registry.WithRegisterService()` or `registry-type: service` |

## Implicit Defaults and Behaviors

Several behaviors are easy to miss because they are derived implicitly when a field is left unset:

- If `registry-type` is not configured, dubbo-go falls back to application-level registration and discovery.
- Application-level consumers subscribe with `tri` by default if the reference does not explicitly set a business protocol.
- `metadata-type` defaults to `local`, so consumers fetch metadata from the provider metadata service unless remote metadata is explicitly enabled.
- In local metadata mode, `metadata-service-protocol` defaults to `dubbo`.
- If `metadata-service-port` is not configured, the metadata service first tries to reuse the default protocol port; if no usable port is available, dubbo-go falls back to a random port.
- Registries default to `use-as-meta-report=true`, so a registry can be reused as the metadata report center unless `registry.WithoutUseAsMetaReport()` is set.
- Registries also default to `use-as-config-center=true`, so the same registry may be reused as the config center unless `registry.WithoutUseAsConfigCenter()` is set.

## Recommendations

- Use `service` registration for application-level service discovery.
- Use `all` during migration if old interface-level consumers still exist.
- Use local metadata for simple deployments and samples.
- Use remote metadata when a metadata center is available and consumers should avoid provider metadata RPC.
- Configure `metadata-service-protocol` explicitly when local metadata is used and the default metadata transport is not desired.
