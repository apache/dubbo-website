---
type: docs
title: AOP and Extensibility Mechanisms
keywords: AOP and extensibility mechanisms
description: AOP and extensibility mechanisms
---

## 1. extension module and init method

### 1.1 Interface and implementation

An interface in golang is often accompanied by multiple implementation classes, dubbo-go provides a pluggable and extensible mechanism for interface implementation classes. Reduce the coupling between modules, making it easier for developers to introduce and customize components.

### 1.2 init method in golang

The init method is a special method in golang. After the user introduces a group of modules, the init method in these modules will be executed first when the program starts to perform loading logic. This method is an important way for dubbogo to register extension components.

### 1.3 extension module

In the framework source code, there is a special module: common/extension, which is responsible for caching the implementation of all extensible components.

Take the load balancing module as an example: common/extension/loadbalance.go

```go
package extension

import (
"dubbo.apache.org/dubbo-go/v3/cluster/loadbalance"
)

var loadbalances = make(map[string]func() loadbalance. LoadBalance)

// SetLoadbalance sets the loadbalance extension with @name
// For example: random/round_robin/consistent_hash/least_active/...
func SetLoadbalance(name string, fcn func() loadbalance. LoadBalance) {
loadbalances[name] = fcn
}

// GetLoadbalance finds the loadbalance extension with @name
func GetLoadbalance(name string) loadbalance. LoadBalance {
if loadbalances[name] == nil {
panic("loadbalance for " + name + " is not existing, make sure you have import the package.")
}

return loadbalances[name]()
}
```

This module contains Get method and Set method. Get returns the instantiated LoadBalance interface, the Set method is used to register factory functions, and map is used to cache factory functions.

When the user imports _ "dubbo.apache.org/dubbo-go/v3/cluster/loadbalance/random", the init function of the corresponding module will be loaded, and the Set method will be called to register the unique key and factory function and add them to the above map.

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

So far, when all init methods are executed, the instantiated object can be obtained through the extension module Get method.

### 1.4 imports module

dubbogo puts all built-in modules in imports/imports.go. When users use the framework, they need to import this module to use the basic capabilities provided by the framework.

```go
import (
_ "dubbo.apache.org/dubbo-go/v3/imports"
)
```

## 2. Component loading process

1. The user introduces _ "dubbo.apache.org/dubbo-go/v3/imports" into the code

2. The program starts, the init function is executed in sequence, and the factory function/instantiated object is registered to the extension module.

3. The framework starts, loads the configuration, obtains the key of the module to be loaded in the configuration, and obtains the instantiated object according to the key.

4. Users can also manually call the Get method of the extension to obtain the instantiated object and use it directly.

## 3. Custom components

On the basis of the above introduction, developers can follow the example of built-in modules and write custom extension components.


## 4. Aspect-Oriented Programming Design (AOP)

In the Dubbo-go service framework, many interfaces are designed based on the idea of AOP. For example Invoker, Filter, LoadBalance, Router.

Multiple implementations of these interfaces often form a set of call chains, and a single implementation class only handles the logic it cares about.

Related reading: [[AOP wikipedia]](https://en.wikipedia.org/wiki/Aspect-oriented_programming)