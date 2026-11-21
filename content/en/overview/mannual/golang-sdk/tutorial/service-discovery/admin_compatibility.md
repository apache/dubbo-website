---
title: Viewing Dubbo-go Services in Dubbo Admin
description: How Dubbo Admin shows applications, instances, services and methods from Dubbo-go's application-level service discovery data, and the versions and settings required
type: docs
weight: 13
---

Dubbo-go uses [application-level service discovery]({{< relref "./application-level-service-discovery.md" >}}) by default. Dubbo Admin does not need Dubbo-go to fall back to interface-level registration. Each page gets its data from:

| Admin page | Data source |
|---|---|
| Application list, instance list, instance detail | Application-level instances in the registry |
| Service list, service detail | Service definitions the provider publishes to the metadata center |
| Method list, method detail (parameter and return types) | Same as above |

The steps below were verified with Nacos, the Dubbo Admin `develop` branch ([65bce33](https://github.com/apache/dubbo-admin/commit/65bce33)) and the Dubbo-go `develop` branch ([ba67101](https://github.com/apache/dubbo-go/commit/ba671017)).

## Versions

The service list and method information depend on the provider publishing service definitions, which is currently only available on the Dubbo-go `develop` branch:

| Symptom (v3.3.2 and earlier) | Fix |
|---|---|
| Applications and instances are visible, but no Dubbo-go service appears in the service list | [#3711](https://github.com/apache/dubbo-go/pull/3711) (Nacos), [#3798](https://github.com/apache/dubbo-go/pull/3798) (ZooKeeper) |
| Triple services generated from `.proto` files are missing from the service list | [#3796](https://github.com/apache/dubbo-go/pull/3796) |
| Methods whose parameters or results contain a `time.Time` field are missing, and the service may not appear at all | [#3806](https://github.com/apache/dubbo-go/pull/3806) |
| The instance's register state is `UnRegistered` and the register time is empty | [#3807](https://github.com/apache/dubbo-go/pull/3807) |

Only the Nacos and ZooKeeper metadata centers can publish service definitions. Other metadata centers, such as etcd, do not publish them.

## Configuration

The defaults are enough:

- The registry also serves as the metadata center by default (`use-as-meta-report=true`), so service definitions are written to the same Nacos or ZooKeeper.
- Service definitions are published by default. To turn this off, use `metadata.WithReportDefinition(false)` in the metadata report configuration; Admin will then show no services or methods for the application.
- Publishing does not depend on `metadata-type`. Both `local` and `remote` publish service definitions.

Service definitions are published asynchronously after the instance registers, and failures are retried with backoff. This provider log line means the definition was published:

```text
[Metadata][Definition] published definition for greet.GreetService, methods=1 types=2
```

For Admin's `discovery` configuration, see [Using Routing Rules with Dubbo Admin]({{< relref "../traffic/admin_compatibility.md#2-start-dubbo-admin" >}}). The metadata center defaults to the `registry` address, the same as Dubbo-go's default.

## What Admin shows

Take a provider application `admin-demo-server` that registers `greet.GreetService` with group `gray` and version `1.0.0`, running two instances:

- **Application list**: `admin-demo-server` with 2 instances.
- **Instance detail**: the IP, RPC port and register time, with register state `Registered`.
- **Service list**: `greet.GreetService` with its group and version.
- **Service detail**: language `golang`, and both instances in the provider list.
- **Method detail**: signature `greet.GreetRequest->greet.GreetResponse`, with the fields of the request and response types.

Dubbo-go types are shown with their Java names, for example `string` as `java.lang.String` and `time.Time` as `java.util.Date`, to match Dubbo Java and Admin's generic invocation.

With application-level discovery a consumer does not register an instance by default, so an application that only calls other services does not appear in the application list. Consumer-side calls can be seen through metrics; see [Observing Dubbo-go Services in Dubbo Admin]({{< relref "../observability/admin_compatibility.md" >}}).

## Checking through the API

When a service is missing from the UI, call Admin's API directly to tell whether Dubbo-go did not publish the data or Admin did not read it:

```shell
A=http://127.0.0.1:8888/api/v1
MESH=nacos-local   # the id of the discovery entry in the Admin configuration

curl -c cookie.txt -X POST -d 'user=admin&password=dubbo@2025' $A/auth/login

curl -b cookie.txt "$A/application/search?keywords=&mesh=$MESH&pageSize=50&pageOffset=0"
curl -b cookie.txt "$A/service/search?keywords=&mesh=$MESH"
curl -b cookie.txt "$A/service/methods?serviceName=greet.GreetService&group=gray&version=1.0.0&mesh=$MESH"
```

If the application list is correct but the service list is empty:

1. Check that the Dubbo-go version includes the fixes in the table above.
2. Look for `[Metadata][Definition]` in the provider log to confirm the definition was published.
3. Check that the definition exists in the metadata center. In Nacos the data ID is `<interface>:<version>:<group>:provider:<application>` (the colons stay when version and group are empty, for example `greet.GreetService:::provider:demo`) in group `dubbo` (or the metadata center's group, if configured). In ZooKeeper the path is `/dubbo/metadata/<interface>/<version>/<group>/provider/<application>`, with the version and group levels omitted when empty.

With ZooKeeper, the service list can become empty after Admin restarts while the definitions are still in the metadata center; see [dubbo-admin #1638](https://github.com/apache/dubbo-admin/pull/1638).
