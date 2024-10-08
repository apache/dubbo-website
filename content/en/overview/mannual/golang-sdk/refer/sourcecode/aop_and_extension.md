---
aliases:
    - /en/docs3-v2/golang-sdk/preface/design/aop_and_extension/
    - /en/docs3-v2/golang-sdk/preface/design/aop_and_extension/
    - /en/overview/mannual/golang-sdk/preface/design/aop_and_extension/
description: AOP and Extension Mechanism
keywords: AOP and Extension Mechanism
title: AOP and Extension Mechanism
type: docs
---

## 1. Extension Module and Init Method

### 1.1 Interface and Implementation

In Golang, an interface is often accompanied by multiple implementation classes. Dubbo-go provides a pluggable and extensible mechanism for interface implementation classes, reducing coupling between modules and facilitating developers in introducing and customizing components.

### 1.2 Init Method in Golang

The init method, as a special method in Golang, executes first on program startup when a user imports a set of modules, performing loading logic. This method is an important way for dubbogo to register extension components.

### 1.3 Extension Module

In the framework source code, there is a special module: common/extension, which is responsible for caching all the implementations of the extensible components.

Taking the load balancing module as an example: common/extension/loadbalance.go 

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

This module contains Get and Set methods. Get returns the instantiated LoadBalance interface, while Set is used to register factory functions, with a map used for caching these functions.

When the user imports _ "dubbo.apache.org/dubbo-go/v3/cluster/loadbalance/random", the corresponding module's init function will be loaded, calling the Set method to register the unique key and factory function into the above map.

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

Thus, once all init methods have been executed, the instantiated object can be obtained through the extension module's Get method.

### 1.4 Imports Module

Dubbogo places all built-in modules in imports/imports.go; users need to import this module to use the basic capabilities provided by the framework.

```go
import (
	_ "dubbo.apache.org/dubbo-go/v3/imports"
)
```

## 2. Component Loading Process

1. The user imports _ "dubbo.apache.org/dubbo-go/v3/imports"

2. The program starts, executing the init functions sequentially, registering factory functions/instantiated objects to the extension module.

3. The framework starts, loading configuration, retrieving module keys from the configuration and obtaining instantiated objects based on these keys.

4. Users can also manually call the extension's Get method to obtain instantiated objects and use them directly.

## 3. Custom Components

Based on the above introduction, developers can emulate built-in modules and write custom extension components.

## 4. Aspect-Oriented Programming Design (AOP)

In the Dubbo-go service framework, many interfaces are designed based on AOP concepts. For example, Invoker, Filter, LoadBalance, and Router.

These multiple implementations often form a chain of calls, with a single implementation class only handling its relevant logic.

Related Reading: [【AOP wikipedia】](https://en.wikipedia.org/wiki/Aspect-oriented_programming)

