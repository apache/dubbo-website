---
title: Viewing Dubbo-go Services in Dubbo Admin
linkTitle: Dubbo Admin integration
description: View Dubbo-go applications, instances, services and methods in Dubbo Admin, and debug services
type: docs
weight: 13
---

Dubbo-go uses [application-level service discovery]({{< relref "./application-level-service-discovery.md" >}}) by default, and works with Dubbo Admin without switching back to interface-level registration. Each Admin page gets its data from:

| Admin page | Data source |
|---|---|
| Application list, instance list, instance detail | Application-level instances in the registry |
| Service list, service detail | Service definitions published by the provider to the metadata center |
| Method list, method detail | Same as above, including parameter and return types |
| Debug | Calls the chosen instance directly; for Triple IDL services, message definitions come from server reflection |

The service list and method information depend on the provider publishing service definitions, which requires a Dubbo-go release after v3.3.2. With earlier versions, Admin shows applications and instances, but no services or methods.

## Prerequisites

- Start Nacos or ZooKeeper as the registry and metadata center.
- Start Dubbo Admin with `discovery` pointing at the same registry; see [Using Routing Rules with Dubbo Admin]({{< relref "../traffic/admin_compatibility.md#2-start-dubbo-admin" >}}).

Only the Nacos and ZooKeeper metadata centers support publishing service definitions.

## Configuration

The defaults are enough:

- The registry also serves as the metadata center by default, so service definitions are written to the same Nacos or ZooKeeper.
- Service definitions are published by default, whether `metadata-type` is `local` or `remote`. To turn this off, use `metadata.WithReportDefinition(false)` in the metadata report configuration; Admin will then show no services or methods for the application.

Service definitions are published asynchronously after the instance registers, and failures are retried automatically. This provider log line means the definition was published:

```text
[Metadata][Definition] published definition for greet.GreetService, methods=1 types=2
```

## Viewing in Admin

Take a provider application `admin-demo-server` that registers `greet.GreetService` with group `gray` and version `1.0.0`, running two instances:

- **Application list**: `admin-demo-server` with 2 instances.
- **Instance detail**: the IP, RPC port and register time, with register state `Registered`.
- **Service list**: `greet.GreetService` with its group and version.
- **Service detail**: language `golang`, and both instances in the provider list.
- **Method detail**: signature `greet.GreetRequest->greet.GreetResponse`, with the fields of the request and response types.

## Debugging services in Admin

On the **Debug** tab of a service, choose a method and an instance to call the provider directly; the result appears in the response area. The call goes to the chosen instance, with the service's group and version.

Dubbo-go Triple services are usually defined with Protobuf IDL. To call such a service, Admin requires that:

- The provider serves server reflection. With `dubbo.apache.org/dubbo-go/v3/imports` imported, the Triple server exports the reflection service `grpc.reflection.v1alpha.ServerReflection` by default, with no extra configuration.
- The method is unary. Admin does not support streaming methods yet.
- The provider does not enable TLS or authentication.

The request is a JSON array with a single element: the request message in Protobuf JSON format, with field names as defined in the `.proto` file and 64-bit integers as strings. For the `Greet` method of `greet.GreetService`:

```json
[{"name": "Ada"}]
```

The response is shown in Protobuf JSON format as well. For a non-IDL service, each element of the request array is one argument of the method.

## FAQ

### 1. The application list is correct, but the service list is empty

1. Check that the Dubbo-go version publishes service definitions and that the metadata center is Nacos or ZooKeeper.
2. Look for `[Metadata][Definition]` in the provider log to confirm the definition was published.
3. Check that the definition exists in the metadata center:
   - Nacos: group `dubbo` (or the metadata center's group, if configured), data ID `<interface>:<version>:<group>:provider:<application>`. The colons stay when version and group are empty, for example `greet.GreetService:::provider:demo`.
   - ZooKeeper: path `/dubbo/metadata/<interface>/<version>/<group>/provider/<application>`, with the version and group levels omitted when empty.

You can also call Admin's API directly to tell whether Dubbo-go did not publish the data or Admin did not read it:

```shell
A=http://127.0.0.1:8888/api/v1
MESH=nacos-local   # the id of the discovery entry in the Admin configuration

curl -c cookie.txt -X POST -d 'user=admin&password=dubbo@2025' $A/auth/login
curl -b cookie.txt "$A/service/search?keywords=&mesh=$MESH"
curl -b cookie.txt "$A/service/methods?serviceName=greet.GreetService&group=gray&version=1.0.0&mesh=$MESH"
```

### 2. Parameter types are shown as Java types

Admin shows types with their Java names, for example `string` as `java.lang.String` and `time.Time` as `java.util.Date`. This matches Dubbo Java and Admin's generic invocation, and does not affect calls. Debug requests for Triple IDL services are written in Protobuf JSON, see [Debugging services in Admin](#debugging-services-in-admin).

### 3. An application that only calls other services is not in the application list

With application-level discovery a consumer does not register an instance by default, so a consumer-only application does not appear in the application list. Consumer-side calls can be seen through metrics; see [Observing Dubbo-go Services in Dubbo Admin]({{< relref "../observability/admin_compatibility.md" >}}).
