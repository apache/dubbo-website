---
aliases:
    - /zh/docs3-v2/golang-sdk/preface/design/aop_and_extension/
    - /zh-cn/docs3-v2/golang-sdk/preface/design/aop_and_extension/
description: AOP 与可扩展机制
keywords: AOP 与可扩展机制
title: AOP 与可扩展机制
type: docs
---

## 1. extension 模块与 init 方法

### 1.1 接口与实现

golang 中的一个接口往往伴随多个实现类，dubbo-go 提供了针对接口实现类的可插拔可扩展机制。降低模块之间的耦合性，方便开发者引入、自定义组件。

### 1.2 golang 中的 init 方法

init 方法作为 golang 中特殊的方法，用户引入一组模块后，会在程序启动时率先执行这些模块内的init 方法，进行加载逻辑，该方法是dubbogo注册扩展组件的重要方式。

### 1.3 extension 模块

在框架源码中，有一个特殊的模块: common/extension ，这一模块负责缓存所有可扩展组件的实现。

以负载均衡模块为例：common/extension/loadbalance.go 

```go
package extension

import (
	"dubbo.apache.org/dubbo-go/v3/cluster/loadbalance"
)

var loadbalances = make(map[string]func() loadbalance.LoadBalance)

// SetLoadbalance sets the loadbalance extension with @name
// For example: random/round_robin/consistent_hash/least_active/...
func SetLoadbalance(name string, fcn func() loadbalance.LoadBalance) {
	loadbalances[name] = fcn
}

// GetLoadbalance finds the loadbalance extension with @name
func GetLoadbalance(name string) loadbalance.LoadBalance {
	if loadbalances[name] == nil {
		panic("loadbalance for " + name + " is not existing, make sure you have import the package.")
	}

	return loadbalances[name]()
}
```

该模块包含Get 方法和Set方法。Get 返回实例化的 LoadBalance 接口，Set 方法用于注册工厂函数，map 用于缓存工厂函数。

当用户引入 _ "dubbo.apache.org/dubbo-go/v3/cluster/loadbalance/random" 时，将会加载对应模块的init函数，调用 Set 方法注册唯一key和工厂函数和到上述map中。

cluster/loadbalance/random/loadbalance.go

```go
package random

import (
	"math/rand"
)

import (
	"dubbo.apache.org/dubbo-go/v3/cluster/loadbalance"
	"dubbo.apache.org/dubbo-go/v3/common/constant"
	"dubbo.apache.org/dubbo-go/v3/common/extension"
	"dubbo.apache.org/dubbo-go/v3/protocol"
)

func init() {
	extension.SetLoadbalance(constant.LoadBalanceKeyRandom, NewRandomLoadBalance)
}
```

至此，当所有init方法执行完毕，可以通过 extension 模块 Get 方法来获取实例化对象。

### 1.4 imports 模块

dubbogo 将所有内置的模块全部放置在 imports/imports.go 内，用户在使用框架时，需要引入该模块，从而使用框架提供的基础能力。

```go
import (
	_ "dubbo.apache.org/dubbo-go/v3/imports"
)
```

## 2. 组件加载流程

1. 用户在代码中引入 _ "dubbo.apache.org/dubbo-go/v3/imports"

2. 程序启动，init 函数被依次执行，注册工厂函数/实例化对象到 extension 模块。

3. 框架启动，加载配置，配置中获取需要加载的模块key，根据key获取实例化对象。

4. 用户也可以手动调用 extension 的 Get 方法，获取实例化对象并直接使用。

## 3. 自定义组件

在上述介绍的基础之上，开发人员可以效仿内置模块，编写自定义扩展组件。


## 4. 面向切面编程的设计（AOP）

在 Dubbo-go 服务框架中，许多接口是基于 AOP 的思路进行设计的。例如 Invoker、Filter、LoadBalance、Router。

这些接口的多种实现往往组成一组调用链，单个实现类只处理自己所关注的逻辑。

相关阅读：[【AOP wikipedia】](https://en.wikipedia.org/wiki/Aspect-oriented_programming)