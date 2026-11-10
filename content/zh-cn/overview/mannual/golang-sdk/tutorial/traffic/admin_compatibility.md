---
title: 与 Dubbo Admin 配合使用路由规则
description: 从启动注册中心、Dubbo Admin 和 Dubbo-go 应用开始，通过 Admin 下发条件路由和标签路由，并说明版本与配置中心的要求
type: docs
weight: 2
---

本文从零搭建一套环境：启动 Nacos 或 ZooKeeper，启动 Dubbo Admin，启动两个 Dubbo-go provider 和一个 consumer，然后在 Admin 中下发条件路由和标签路由，观察 consumer 的调用变化。最后说明规则能否生效所依赖的版本和配置。

以下步骤基于 Dubbo Admin `develop` 分支（[0db71b0](https://github.com/apache/dubbo-admin/commit/0db71b07b9d94b2f57e3ffd22af5e55e6083e63f)）、Dubbo-go v3.3.2 与 `develop` 分支验证。

## 版本选择

Dubbo Admin 写出的条件路由固定为 `configVersion: v3.0` 格式（条件以字符串存储，界面和 YAML 视图都写死了 `v3.0`），因此下表中的条件路由问题会影响所有通过 Admin 创建的条件规则。

| Dubbo-go 版本 | 条件路由（v3.0 格式） | 标签路由 |
|---|---|---|
| v3.3.0、v3.3.1 | `enabled` 与 `force` 被互换解析；省略 `enabled` 时 panic | 首次未命中缓存时找不到规则 |
| v3.3.2 | 同上 | 已修复 |
| `develop` | 已修复（[#3773](https://github.com/apache/dubbo-go/pull/3773)） | 已修复 |

- 标签路由：使用 v3.3.2 及以上版本。
- 条件路由：在包含 #3773 的版本发布之前，若使用 v3.3.x，请把 Admin 中的「立即启用」和「容错保护」设为相同的值。两者不同时，效果与界面所示相反：默认的「启用、不容错」不生效，「禁用、容错」则不会禁用规则。

## 端到端示例

### 1. 启动注册中心

Admin 和 Dubbo-go 使用同一个地址同时作为注册中心和配置中心。任选其一：

```shell
# Nacos
docker run -d --name nacos -p 8848:8848 -p 9848:9848 \
  -e MODE=standalone nacos/nacos-server:v2.5.2

# ZooKeeper
docker run -d --name zookeeper -p 2181:2181 zookeeper:3.9.4
```

更多部署方式见 [Nacos]({{< relref "../../../../reference/integrations/nacos.md" >}}) 和 [ZooKeeper]({{< relref "../../../../reference/integrations/zookeeper.md" >}})。

### 2. 启动 Dubbo Admin

目前没有包含所需修复的 Admin 发布包或镜像（Docker Hub 上的 `apache/dubbo-admin` 是旧版 Java Admin），需要从源码构建 `develop` 分支。需要 Go 和 Node.js（含 yarn）。

```shell
git clone -b develop https://github.com/apache/dubbo-admin.git
cd dubbo-admin

# 构建前端并嵌入
cd ui-vue3 && yarn install --frozen-lockfile && yarn build && cd ..
rm -rf app/dubbo-ui/dist && cp -r ui-vue3/dist app/dubbo-ui/dist

# 构建 Admin
go build -o dubbo-admin ./app/dubbo-admin
```

新建配置文件 `admin.yaml`。`ginMode` 和 `expirationTime` 必须填写，`sessionSecret` 至少 32 字节：

```yaml
console:
  port: 8888
  ginMode: release
  auth:
    user: admin
    password: dubbo@2025
    sessionSecret: "<替换为 openssl rand -base64 32 的输出>"
    expirationTime: 3600
discovery:
  - type: nacos2
    name: nacos-local
    id: nacos-local
    address:
      registry: nacos://127.0.0.1:8848
```

使用 ZooKeeper 时，把 `discovery` 换成：

```yaml
discovery:
  - type: zookeeper
    name: zk-local
    id: zk-local
    address:
      registry: zookeeper://127.0.0.1:2181
```

配置中心和元数据中心默认使用 `registry` 的地址。启动：

```shell
./dubbo-admin run -c admin.yaml
```

打开 `http://127.0.0.1:8888/admin/`，用配置中的账号登录。完整配置项见 Admin 仓库的 [dubbo-admin.yaml](https://github.com/apache/dubbo-admin/blob/develop/app/dubbo-admin/dubbo-admin.yaml) 和 [server-develop.md](https://github.com/apache/dubbo-admin/blob/develop/docs/server-develop.md)。

### 3. 启动 Dubbo-go 应用

示例使用 [dubbo-go-samples](https://github.com/apache/dubbo-go-samples) 中 `router/tag/proto` 定义的 `greet.GreetService`，把该目录复制到自己的模块中即可。

provider 的应用名为 `router-demo-server`，同时启动两个实例，分别监听 20000 和 20001 端口：

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

consumer 的应用名为 `router-demo-client`，每秒调用一次。路由规则在 consumer 侧生效，因此 consumer 必须配置配置中心：

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
			config_center.WithGroup("dubbo"), // 与 Admin 写入的 group 一致
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

使用 ZooKeeper 时，把注册中心换成 `registry.WithZookeeper(), registry.WithAddress("127.0.0.1:2181")`，配置中心只保留 `config_center.WithZookeeper(), config_center.WithAddress("127.0.0.1:2181")`，不需要设置 group。

启动：

```shell
PORT=20000 go run ./server &
PORT=20001 go run ./server &
go run ./client             # 普通调用
TAG=gray go run ./client    # 携带 dubbo.tag=gray 的调用
```

两个 provider 启动后，可以在 Admin 的应用列表中看到 `router-demo-server`（使用 Nacos 时可能需要等待约 30 秒）。此时 consumer 的调用在 20000 和 20001 之间随机分布。

使用 YAML 配置时，consumer 的配置如下，通过环境变量 `DUBBO_GO_CONFIG_PATH` 指定（见[配置文件]({{< relref "../configuration/file.md" >}})）：

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

### 4. 在 Admin 中下发标签路由

在 Admin 的标签路由页面新增规则，切换到 YAML 视图，填入：

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

保存后，普通调用只落到 20000，带 `dubbo.tag=gray` 的调用只落到 20001。删除规则后，两类调用恢复随机分布（v3.3.2 使用 Nacos 时除外，见[规则的更新与删除](#规则的更新与删除)）。

规则作用于 provider，`key` 使用 provider 的应用名。按端口区分实例时请使用 `addresses`：在应用级服务发现下，consumer 看不到 provider 通过 `server.WithParam` 设置的自定义参数，用 `match` 匹配这些参数选不中实例。

### 5. 在 Admin 中下发条件路由

当前 `develop` 分支的 Admin 界面无法新建条件路由（表单提交的规则名缺少 `.condition-router` 后缀；YAML 视图要求应用级规则也填写版本和分组），但已有规则可以在界面中编辑、禁用和删除。新建规则可以调用 Admin 的接口，这也是界面使用的接口：

```shell
A=http://127.0.0.1:8888/api/v1
MESH=nacos-local   # Admin 配置中 discovery 的 id，ZooKeeper 为 zk-local

curl -c cookie.txt -X POST -d 'user=admin&password=dubbo@2025' $A/auth/login

curl -b cookie.txt -H 'Content-Type: application/json' \
  -X POST "$A/condition-rule/router-demo-server.condition-router?mesh=$MESH" \
  -d '{"configVersion":"v3.0","scope":"application","key":"router-demo-server",
       "enabled":true,"force":true,"runtime":true,
       "conditions":["application=router-demo-client => port=20001"]}'
```

规则生效后，`router-demo-client` 的调用只落到 20001。这里 `enabled` 和 `force` 都设为 `true`，原因见[版本选择](#版本选择)；使用包含 #3773 的版本时，`force` 可以按需设置。

在界面中关闭「立即启用」或删除规则后，调用恢复随机分布。在 v3.3.x 上禁用规则时，需要同时关闭「容错保护」。

## 配置中心对齐

Dubbo Admin 和 Dubbo-go 需要读写同一个位置，仅连接同一个配置中心是不够的。

**Nacos**：Admin 以规则名作为 data ID，写入 group `dubbo`。Dubbo-go 需要将配置中心的 group 设为 `dubbo`（YAML 中的 `config-center.group`，或代码中的 `config_center.WithGroup("dubbo")`），默认的 `DEFAULT_GROUP` 读不到规则。

**ZooKeeper**：Admin `develop` 分支自 [dubbo-admin #1553](https://github.com/apache/dubbo-admin/pull/1553) 起将规则写入 `/dubbo/config/dubbo/<规则名>`，与 Dubbo-go 的默认读取路径一致，Dubbo-go 无需额外配置。

更早的 Admin（如 0.7.0-pre）将规则写入 `/dubbo/config/<规则名>`（见 [dubbo-admin #1625](https://github.com/apache/dubbo-admin/issues/1625)）。只有配合这类 Admin 时，才需要让 Dubbo-go 改为读取该路径：

```yaml
dubbo:
  config-center:
    protocol: zookeeper
    address: 127.0.0.1:2181
    namespace: config
    params:
      dubbo.config-center.root-path: /dubbo
```

配合 `develop` 分支的 Admin 使用上述配置，反而会读不到规则。

规则名的格式：

- 应用级条件路由：`<provider 应用名>.condition-router`
- 服务级条件路由：`<接口名>:<版本>:<分组>.condition-router`
- 标签路由：`<provider 应用名>.tag-router`

## 规则的更新与删除

规则的更新、禁用和删除依赖配置中心的监听事件。

- `develop` 分支：使用 `nacos-sdk-go/v2` v2.3.5 和 `dubbogo/gost` v1.15.0，Nacos 和 ZooKeeper 上的更新、禁用、删除均正常。相关修复见 [dubbo-go #3771](https://github.com/apache/dubbo-go/pull/3771) 和 [gost #155](https://github.com/dubbogo/gost/pull/155)。
- v3.3.2：使用 Nacos 时，请将 `nacos-sdk-go/v2` 升级到 v2.3.5，否则收不到删除事件；`gost` 保持 v1.14.3，升级到 v1.15.0 会编译失败。即便如此，Nacos 上删除标签规则后旧规则仍会生效，需要停用标签规则时请改为禁用。ZooKeeper 上的更新、禁用和删除均正常。

## 禁用标签路由

较早版本的 Admin 在禁用标签规则时不写 `enabled: false` 字段，而 Dubbo-go 会把缺省的 `enabled` 当作 `true`，导致规则无法禁用。[dubbo-admin #1595](https://github.com/apache/dubbo-admin/pull/1595) 已改为显式写出该字段，`develop` 分支包含此修复。

当前在界面中编辑并禁用标签规则时，规则中的 `addresses` 会被清空。重新启用前，请在 YAML 视图中补回 `addresses`。

## 参考

相关回归测试与验证记录见 [dubbo-go #3799](https://github.com/apache/dubbo-go/pull/3799)。
