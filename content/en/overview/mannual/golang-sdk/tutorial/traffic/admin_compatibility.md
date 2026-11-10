---
title: Using Routing Rules with Dubbo Admin
description: Start a registry, Dubbo Admin and Dubbo-go applications, push condition and tag routing rules from Admin, and check the version and config center requirements
type: docs
weight: 2
---

This page builds a complete setup from scratch: start Nacos or ZooKeeper, start Dubbo Admin, start two Dubbo-go providers and one consumer, then push a condition rule and a tag rule from Admin and watch how the consumer's calls change. The last sections cover the versions and settings that decide whether a rule takes effect.

The steps were verified with the Dubbo Admin `develop` branch ([0db71b0](https://github.com/apache/dubbo-admin/commit/0db71b07b9d94b2f57e3ffd22af5e55e6083e63f)), Dubbo-go v3.3.2 and the Dubbo-go `develop` branch.

## Choosing a version

Dubbo Admin always writes condition rules as `configVersion: v3.0` (conditions are stored as strings, and both the form and the YAML view hard-code `v3.0`). The condition routing issues below therefore affect every condition rule created in Admin.

| Dubbo-go version | Condition rules (v3.0 format) | Tag rules |
|---|---|---|
| v3.3.0, v3.3.1 | `enabled` and `force` are swapped; omitting `enabled` panics | The rule is not found on the first uncached lookup |
| v3.3.2 | Same as above | Fixed |
| `develop` | Fixed ([#3773](https://github.com/apache/dubbo-go/pull/3773)) | Fixed |

- Tag rules: use v3.3.2 or later.
- Condition rules: until a release includes #3773, set "立即启用" (enabled) and "容错保护" (force) in Admin to the same value when you run v3.3.x. When they differ, the effect is the opposite of what the UI shows: the default "enabled, no force" has no effect, and "disabled, force" does not disable the rule.

## End-to-end example

### 1. Start a registry

Admin and Dubbo-go use the same address as both registry and config center. Pick one:

```shell
# Nacos
docker run -d --name nacos -p 8848:8848 -p 9848:9848 \
  -e MODE=standalone nacos/nacos-server:v2.5.2

# ZooKeeper
docker run -d --name zookeeper -p 2181:2181 zookeeper:3.9.4
```

See [Nacos]({{< relref "../../../../reference/integrations/nacos.md" >}}) and [ZooKeeper]({{< relref "../../../../reference/integrations/zookeeper.md" >}}) for other deployment options.

### 2. Start Dubbo Admin

No Admin release or image includes the fixes this page relies on yet (`apache/dubbo-admin` on Docker Hub is the old Java Admin), so build the `develop` branch from source. You need Go and Node.js with yarn.

```shell
git clone -b develop https://github.com/apache/dubbo-admin.git
cd dubbo-admin

# Build the UI and embed it
cd ui-vue3 && yarn install --frozen-lockfile && yarn build && cd ..
rm -rf app/dubbo-ui/dist && cp -r ui-vue3/dist app/dubbo-ui/dist

# Build Admin
go build -o dubbo-admin ./app/dubbo-admin
```

Create `admin.yaml`. `ginMode` and `expirationTime` are required, and `sessionSecret` must be at least 32 bytes:

```yaml
console:
  port: 8888
  ginMode: release
  auth:
    user: admin
    password: dubbo@2025
    sessionSecret: "<output of openssl rand -base64 32>"
    expirationTime: 3600
discovery:
  - type: nacos2
    name: nacos-local
    id: nacos-local
    address:
      registry: nacos://127.0.0.1:8848
```

For ZooKeeper, replace `discovery` with:

```yaml
discovery:
  - type: zookeeper
    name: zk-local
    id: zk-local
    address:
      registry: zookeeper://127.0.0.1:2181
```

The config center and metadata report default to the `registry` address. Start Admin:

```shell
./dubbo-admin run -c admin.yaml
```

Open `http://127.0.0.1:8888/admin/` and log in with the account from the config. For all options, see [dubbo-admin.yaml](https://github.com/apache/dubbo-admin/blob/develop/app/dubbo-admin/dubbo-admin.yaml) and [server-develop.md](https://github.com/apache/dubbo-admin/blob/develop/docs/server-develop.md) in the Admin repository.

### 3. Start the Dubbo-go applications

The example uses `greet.GreetService` from `router/tag/proto` in [dubbo-go-samples](https://github.com/apache/dubbo-go-samples). Copy that directory into your own module.

The provider's application name is `router-demo-server`. Run two instances, on ports 20000 and 20001:

```go
package main

import (
	"context"
	"os"
	"strconv"

	"dubbo.apache.org/dubbo-go/v3"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/protocol"
	"dubbo.apache.org/dubbo-go/v3/registry"

	greet "example.com/routerdemo/proto"
)

type GreetServer struct{ port string }

func (s *GreetServer) Greet(_ context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	return &greet.GreetResponse{Greeting: req.Name + " from port " + s.port}, nil
}

func main() {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	ins, err := dubbo.NewInstance(
		dubbo.WithName("router-demo-server"),
		dubbo.WithRegistry(registry.WithNacos(), registry.WithAddress("127.0.0.1:8848")),
		dubbo.WithProtocol(protocol.WithTriple(), protocol.WithPort(port)),
	)
	if err != nil {
		panic(err)
	}
	srv, err := ins.NewServer()
	if err != nil {
		panic(err)
	}
	if err := greet.RegisterGreetServiceHandler(srv, &GreetServer{port: os.Getenv("PORT")}); err != nil {
		panic(err)
	}
	if err := srv.Serve(); err != nil {
		panic(err)
	}
}
```

The consumer's application name is `router-demo-client`, and it makes one call per second. Routing rules are applied on the consumer side, so the consumer must have a config center:

```go
package main

import (
	"context"
	"os"
	"time"

	"dubbo.apache.org/dubbo-go/v3"
	"dubbo.apache.org/dubbo-go/v3/common/constant"
	"dubbo.apache.org/dubbo-go/v3/config_center"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo.apache.org/dubbo-go/v3/registry"
	"github.com/dubbogo/gost/log/logger"

	greet "example.com/routerdemo/proto"
)

func main() {
	ins, err := dubbo.NewInstance(
		dubbo.WithName("router-demo-client"),
		dubbo.WithRegistry(registry.WithNacos(), registry.WithAddress("127.0.0.1:8848")),
		dubbo.WithConfigCenter(
			config_center.WithNacos(),
			config_center.WithAddress("127.0.0.1:8848"),
			config_center.WithGroup("dubbo"), // same group that Admin writes to
		),
	)
	if err != nil {
		panic(err)
	}
	cli, err := ins.NewClient()
	if err != nil {
		panic(err)
	}
	svc, err := greet.NewGreetService(cli)
	if err != nil {
		panic(err)
	}
	for i := 0; ; i++ {
		ctx := context.Background()
		if tag := os.Getenv("TAG"); tag != "" {
			ctx = context.WithValue(ctx, constant.AttachmentKey, map[string]string{constant.Tagkey: tag})
		}
		rep, err := svc.Greet(ctx, &greet.GreetRequest{Name: "call"})
		if err != nil {
			logger.Errorf("call %d failed: %v", i, err)
		} else {
			logger.Infof("call %d -> %s", i, rep.Greeting)
		}
		time.Sleep(time.Second)
	}
}
```

For ZooKeeper, use `registry.WithZookeeper(), registry.WithAddress("127.0.0.1:2181")` for the registry, and only `config_center.WithZookeeper(), config_center.WithAddress("127.0.0.1:2181")` for the config center. No group is needed.

Start them:

```shell
PORT=20000 go run ./server &
PORT=20001 go run ./server &
go run ./client             # plain calls
TAG=gray go run ./client    # calls with dubbo.tag=gray
```

Once both providers are up, `router-demo-server` appears in Admin's application list (with Nacos this can take about 30 seconds), and the consumer's calls are spread randomly across 20000 and 20001.

With YAML configuration, the consumer config looks like this and is selected with the `DUBBO_GO_CONFIG_PATH` environment variable (see [Configuration file]({{< relref "../configuration/file.md" >}})):

```yaml
dubbo:
  application:
    name: router-demo-client
  registries:
    nacos:
      protocol: nacos
      address: 127.0.0.1:8848
  config-center:
    protocol: nacos
    address: 127.0.0.1:8848
    group: dubbo
  consumer:
    references:
      GreetServiceImpl:
        protocol: tri
        interface: greet.GreetService
        registry: nacos
```

### 4. Push a tag rule from Admin

Add a rule on Admin's tag routing page, switch to the YAML view, and enter:

```yaml
configVersion: v3.0
key: router-demo-server
enabled: true
force: false
runtime: true
tags:
  - name: gray
    addresses: ["0.0.0.0:20001"]
```

After saving, plain calls go only to 20000 and calls with `dubbo.tag=gray` go only to 20001. After you delete the rule, both kinds of calls are spread randomly again (except on v3.3.2 with Nacos; see [Updating and deleting rules](#updating-and-deleting-rules)).

The rule applies to the provider, so `key` is the provider's application name. Use `addresses` to select instances by port: under application-level service discovery, the consumer does not see custom parameters that the provider sets with `server.WithParam`, so a `match` on them selects nothing.

### 5. Push a condition rule from Admin

The Admin UI on the current `develop` branch cannot create condition rules: the form submits a rule name without the `.condition-router` suffix, and the YAML view asks for a version and group even for application-scoped rules. Existing rules can still be edited, disabled and deleted in the UI. To create one, call the Admin API, which is the same API the UI uses:

```shell
A=http://127.0.0.1:8888/api/v1
MESH=nacos-local   # discovery id from the Admin config; zk-local for ZooKeeper

curl -c cookie.txt -X POST -d 'user=admin&password=dubbo@2025' $A/auth/login

curl -b cookie.txt -H 'Content-Type: application/json' \
  -X POST "$A/condition-rule/router-demo-server.condition-router?mesh=$MESH" \
  -d '{"configVersion":"v3.0","scope":"application","key":"router-demo-server",
       "enabled":true,"force":true,"runtime":true,
       "conditions":["application=router-demo-client => port=20001"]}'
```

Once the rule is in effect, calls from `router-demo-client` go only to 20001. Both `enabled` and `force` are `true` here for the reason given in [Choosing a version](#choosing-a-version). With a version that includes #3773, set `force` as needed.

Turning off "立即启用" in the UI, or deleting the rule, spreads the calls randomly again. To disable the rule on v3.3.x, turn off "容错保护" as well.

## Aligning the config center

Dubbo Admin and Dubbo-go have to read and write the same location. Connecting to the same config center is not enough.

**Nacos**: Admin uses the rule name as the data ID and writes to group `dubbo`. Set the Dubbo-go config center group to `dubbo` (`config-center.group` in YAML, or `config_center.WithGroup("dubbo")` in code). The default `DEFAULT_GROUP` does not see the rules.

**ZooKeeper**: since [dubbo-admin #1553](https://github.com/apache/dubbo-admin/pull/1553), the Admin `develop` branch writes rules to `/dubbo/config/dubbo/<rule name>`. That is Dubbo-go's default read path, so Dubbo-go needs no extra settings.

Older Admin builds such as 0.7.0-pre write rules to `/dubbo/config/<rule name>` (see [dubbo-admin #1625](https://github.com/apache/dubbo-admin/issues/1625)). Only with such a build does Dubbo-go need to read that path:

```yaml
dubbo:
  config-center:
    protocol: zookeeper
    address: 127.0.0.1:2181
    namespace: config
    params:
      dubbo.config-center.root-path: /dubbo
```

With the `develop` Admin, this config makes Dubbo-go miss the rules.

Rule name formats:

- Application-scoped condition rule: `<provider application>.condition-router`
- Service-scoped condition rule: `<interface>:<version>:<group>.condition-router`
- Tag rule: `<provider application>.tag-router`

## Updating and deleting rules

Rule updates, disabling and deletion depend on config center watch events.

- `develop`: with `nacos-sdk-go/v2` v2.3.5 and `dubbogo/gost` v1.15.0, updates, disabling and deletion all work on Nacos and ZooKeeper. See [dubbo-go #3771](https://github.com/apache/dubbo-go/pull/3771) and [gost #155](https://github.com/dubbogo/gost/pull/155).
- v3.3.2: with Nacos, upgrade `nacos-sdk-go/v2` to v2.3.5, or delete events are missed. Keep `gost` at v1.14.3; v1.15.0 does not compile with v3.3.2. Even then, a deleted tag rule on Nacos stays in effect, so disable a tag rule instead when you need to turn it off. On ZooKeeper, updates, disabling and deletion all work.

## Disabling tag rules

Older Admin versions did not write the `enabled: false` field when a tag rule was disabled, and Dubbo-go treats a missing `enabled` as `true`, so the rule could not be disabled. [dubbo-admin #1595](https://github.com/apache/dubbo-admin/pull/1595) writes the field explicitly, and the `develop` branch includes it.

Editing and disabling a tag rule in the UI currently clears the rule's `addresses`. Add `addresses` back in the YAML view before enabling the rule again.

## References

The related regression tests and verification records are in [dubbo-go #3799](https://github.com/apache/dubbo-go/pull/3799).
