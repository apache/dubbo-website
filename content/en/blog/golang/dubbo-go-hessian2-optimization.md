---
title: "A Performance Optimization Experience with dubbo-go-hessian2"
linkTitle: "A Performance Optimization Experience with dubbo-go-hessian2"
tags: ["Go"]
date: 2021-01-12
description: >
    This article introduces a performance tuning in dubbo-go-hessian2
---


> dubbo-go-hessian2 is a serialization library implementing version 2.0 of the hessian protocol in Go. As indicated by the project name, it is primarily used in the dubbo-go project. The hessian protocol is the default protocol for dubbo, thus, it has higher performance requirements.

## Project Initiation

For example, in an article titled "Technical Practice of a Distributed IM System for Mafengwo based on Go", a comparison of dubbo-go with other RPC frameworks is as follows:

1. Go STDPRC: Optimal performance but lacks governance;
2. RPCX: Performance advantage 2*GRPC + service governance;
3. GRPC: Cross-language but not as good as RPCX in performance;
4. TarsGo: Cross-language with 5*GRPC performance, but the framework is large and complex to integrate;
5. Dubbo-Go: Slightly inferior in performance, more suitable for communication scenarios between Go and Java.

In light of this, the community started to organize some manpower to initiate performance optimization for dubbo-go【We also welcome the author of the above article to communicate with our community in the DingTalk group 23331795】. In examining various components of dubbo-go, everyone unanimously decided to first optimize the relatively independent dubbo-go-hessian2.

## Initial Steps

At the beginning, there was no clear plan on what to do, where to change, and to what extent to optimize, so the simplest way was to observe the current situation.

First, I wrote a simple example, putting common types into a struct, and then measured the time taken.

```go
type Mix struct {
    A  int
    B  string
    CA time.Time
    CB int64
    CC string
    CD []float64
    D  map[string]interface{}
}

m := Mix{A: int('a'), B: `hello`}
m.CD = []float64{1, 2, 3}
// Adding another layer for complexity
m.D = map[string]interface{}{`floats`: m.CD, `A`: m.A, `m`: m}
```

> Although this struct may not reflect the real environment, it should suffice for analyzing bottlenecks.

Next, I created a test case using Go Test:

```go
func BenchmarkEncode(b *testing.B) {
    for i := 0; i < b.N; i++ {
        _, _ = encodeTarget(&m)
    }
}

func BenchmarkDecode(b *testing.B) {
    for i := 0; i < b.N; i++ {
        _, _ = NewDecoder(bytes).Decode()
    }
}
```

> go test -benchmem -run=^$ github.com/apache/dubbo-go-hessian2 -bench "^B" -vet=off -v

The results obtained were:

```
BenchmarkEncode-8 89461    11485 ns/op    3168 B/op 122 allocs/op
BenchmarkDecode-8 64914    19595 ns/op    7448 B/op 224 allocs/op
```

***Note: Tested on MacBook Pro 2018【Intel Core i7 2.6 GHz】.\***

Not making horizontal comparisons with similar libraries, we cannot derive any conclusions just from these numbers. More importantly for us is: where is it slow? The first thought was to generate a flame graph using pprof to locate CPU consumption.

For the usage of pprof, refer to the official documentation. During testing, I directly used the built-in `CPU Profiler` testing tool in Goland: select `Run xx with 'CPU Profiler'` next to the test function.

![img](/imgs/blog/dubbo-go/hessian/p2.png)

After the test, Goland displayed the flame graph as follows:

![img](/imgs/blog/dubbo-go/hessian/p3.png)

From this graph, it can be seen that the test code occupies about 70% on the left, while the runtime consumption occupies 30% on the right, which generally includes gc and scheduling, neither of which can be directly optimized. On the left, it’s clear to see that `encObject` has `RegisterPOJO` and `Encode` each taking about half.

While it is understandable that `Encode`, which is responsible for serialization, consumes a lot of CPU, intuitively, parsing and registering objects using `RegisterPOJO` should not be such a significant cost. Hence, I speculated that there might be an issue with registration or duplicate registrations.

Next, I analyzed further by adding logs to this function. Then I ran the benchmark again and saw the performance bottleneck was in the container read/write operations.

Now that it is clear that a lot of redundant work is being done here, the optimization method became obvious: caching. Cache the already parsed results for direct retrieval when needed. The improved code is as follows:

```go
if goName, ok := pojoRegistry.j2g[o.JavaClassName()]; ok {
    return pojoRegistry.registry[goName].index
}
```

At first, I had a question about why we take `JavaClassName` first and then `GoName` instead of directly taking the latter? It seems redundant but actually, `JavaClassName` is defined directly in the class, whereas `GoName` requires a reflection call. Comparatively, the overhead of two conversions can be negligible. After making the change, I ran the benchmark again:

```
BenchmarkEncode-8 197593   5601 ns/op   1771 B/op   51 allocs/op
```

I was very surprised to see that the throughput is approximately 200% of the original. Comparing this with the previous flame graph, we can roughly calculate that `RegisterPOJO` occupies about 30% of the total; after the improvement, it should be only `1 / 0.7 * 100% = 140%`. The answer can also be found in the flame graph:

![img](/imgs/blog/dubbo-go/hessian/p4.png)

In addition to `RegisterPOJO` being eliminated, what other differences can be seen compared to the previous graph? Notably, the `GC` that originally occupied nearly 20% is now almost gone. Therefore, the true CPU utilization should also include this growth, roughly `1 / 0.5 * 100% = 200%`.

> It should be noted that the benchmark results are not stable, so the results you derive may not match mine, and multiple runs will yield varying results. You just need to understand the reason behind these numbers; a fluctuation of 10% is normal.

> Conversely, this can be viewed as an angle of GC optimization. When GC consumes too much CPU, aside from replacing object pools one by one, it is also essential to take a close look at frequently called modules. More scientifically, using `pprof heap` / `memory profiler` is recommended.

Regarding these results, it can be observed that everything above `encObject` has been divided into different small segments, no longer having significant allocations like `RegisterPOJO`. Generally, when optimizations reach this point, it is sufficient.

Having reviewed `Encode`, let’s take a look at `Decode`. The method is similar; I generated and viewed the flame graph in Goland:

![img](/imgs/blog/dubbo-go/hessian/p5.png)

This graph can be deceptive, as it appears to be similarly divided into small segments. We can open up the `decObject` layer:

![img](/imgs/blog/dubbo-go/hessian/p6.png)

At this point, the small `...` will display specific contents, and it is important to note that there are two `findField` calls present. In complex calls, it’s common to encounter situations where a resource-intensive function is split across many functions, making it difficult to visually identify it as a bottleneck on the flame graph. Common scenarios include serialization, logging, and network requests, where each module does a small portion of work without having a single global function.

To help identify the bottleneck, we can also rely on another tool:

![img](/imgs/blog/dubbo-go/hessian/p7.png)

In this `Method List`, it is clear that `findField` has been merged together, accounting for almost half of the CPU usage, indicating it’s a potential optimization point.

## Further Steps

The function `func findField(name string, typ reflect.Type) ([]int, error)` is designed to find the position (index, as denoted by the reflection package) of a specified property within a type. It’s easy to see that for a struct, the position of each field is known from the start, so caching can also effectively solve this problem. A simple optimization is shown below:

```go
func findField(name string, typ reflect.Type) (indexes []int, err error) {
    typCache, _ := findFieldCache.LoadOrStore(typ, &sync.Map{})
    indexes, _ := typCache.(*sync.Map).Load(name)
    if len(indexes.([]int)) == 0 {
        err = perrors.Errorf("failed to find field %s", name)
    }

    return indexes.([]int), err

    // ...
}
```

```
- BenchmarkDecode-8 57723    17987 ns/op    7448 B/op    224 allocs/op
+ BenchmarkDecode-8 82995    12272 ns/op    7224 B/op    126 allocs/op
```

The results are not as significant as anticipated, showing only about a 60% improvement. At first glance, this code appears to be just some verbose assertions; why was the improvement only 60%? Using tools again, we can observe the following:

![img](/imgs/blog/dubbo-go/hessian/p8.png)

It can be seen that reading from the cache consumed 7% of the resources. While `sync.(*Map)` cannot be optimized, where does `newobject` originate? The code reveals that the only definition of a new object occurs in `&sync.Map` at the function’s first line. With a trial mindset, I separated `LoadOrStore` into two steps:

```go
typCache, ok := findFieldCache.Load(typ)
if !ok {
    typCache = &sync.Map{}
    findFieldCache.Store(typ, typCache)
}
```

```
- BenchmarkDecode-8          82995         12272 ns/op        7224 B/op         126 allocs/op
+BenchmarkDecode-8         103876         12385 ns/op        6568 B/op         112 allocs/op
```

The result is indeed surprising. It reminds me of seeing similar code while reading Java:

```go
if ( logLevel >= `info` ) {
    log.Info(...)
}
```

I used to think this `if` was such a waste, but reflecting on it now has changed my perspective. If we could provide a `LoadOrStore(key, func() interface{})` method, wouldn't that be better?

At this point, we’ve made some significant optimizations, with overall performance improving by about double. If one closely examines the flame graph, many small optimization points can also be found, but due to the lack of particularly qualitative breakthroughs, I won’t elaborate further. Interested parties can read the relevant discussions in PR Imp: cache in reflection.

## Beyond

Even with these optimizations, there lies a deeper issue: finding a reliable reference benchmark to measure the current work results【After all, without comparison, there is no harm】. A readily conceivable comparison object is the Go language's official `json` standard library.

Below is a comparison between dubbo-go-hessian2 and the `json` standard library:

```bash
$ go test -benchmem -run=^$ github.com/apache/dubbo-go-hessian2 -bench "^B" -vet=off -v -count=5
goos: darwin
goarch: amd64
pkg: github.com/apache/dubbo-go-hessian2
BenchmarkJsonEncode
BenchmarkJsonEncode-8  249114    4719 ns/op    832 B/op  15 allocs/op
BenchmarkJsonEncode-8  252224    4862 ns/op    832 B/op  15 allocs/op
BenchmarkJsonEncode-8  240582    4739 ns/op    832 B/op  15 allocs/op
BenchmarkJsonEncode-8  213283    4784 ns/op    832 B/op  15 allocs/op
BenchmarkJsonEncode-8  227101    4665 ns/op    832 B/op  15 allocs/op
BenchmarkEncode
BenchmarkEncode-8  182184    5615 ns/op    1771 B/op  51 allocs/op
BenchmarkEncode-8  183007    5565 ns/op    1771 B/op  51 allocs/op
BenchmarkEncode-8  218664    5593 ns/op    1771 B/op  51 allocs/op
BenchmarkEncode-8  214704    5886 ns/op    1770 B/op  51 allocs/op
BenchmarkEncode-8  181861    5605 ns/op    1770 B/op  51 allocs/op
BenchmarkJsonDecode
BenchmarkJsonDecode-8 123667    8412 ns/op    1776 B/op  51 allocs/op
BenchmarkJsonDecode-8 122796    8497 ns/op    1776 B/op  51 allocs/op
BenchmarkJsonDecode-8 132103    8471 ns/op    1776 B/op  51 allocs/op
BenchmarkJsonDecode-8 130687    8492 ns/op    1776 B/op  51 allocs/op
BenchmarkJsonDecode-8 127668    8476 ns/op    1776 B/op  51 allocs/op
BenchmarkDecode
BenchmarkDecode-8 107775    10092 ns/op     6424 B/op    98 allocs/op
BenchmarkDecode-8 110996    9950 ns/op     6424 B/op    98 allocs/op
BenchmarkDecode-8 111036    10760 ns/op     6424 B/op    98 allocs/op
BenchmarkDecode-8 113151    10063 ns/op     6424 B/op    98 allocs/op
BenchmarkDecode-8 109197    10002 ns/op     6424 B/op    98 allocs/op
PASS
ok      github.com/apache/dubbo-go-hessian2    28.680s
```

Although the results are unstable, overall, the current serialization and deserialization performance is about 85% of the JSON standard library. This result is not remarkable, but spending 20 minutes to achieve an 80% result in the short term should be acceptable. As for the remaining 20%, it cannot be fixed simply by modifying a few lines of code. Factors like memory allocation efficiency and redundant execution processes need continuous improvements.

## Conclusion

Finally, let's summarize the main optimization steps in this article:

- Use flame graphs to quickly locate CPU-intensive modules;
- Utilize caching mechanisms to rapidly eliminate redundant computations;
- Employ tools like CallTree and MethodList to analyze the precise consumption of small code segments;
- Follow the Pareto Principle to achieve significant gains with minimal costs.

### Welcome to Join the dubbo-go Community

Currently, dubbo-go has reached a relatively stable and mature state. In upcoming versions, we will focus on cloud-native aspects. In the next version, we will first implement service registration at the application level, representing a completely new registration model distinct from the existing one. It is a key version as we strive towards cloud-native standards.

The DingTalk group for dubbo-go is **23331795**; you are welcome to join.

#### Author Information

Zhang Huiren, GitHub ID: micln, works as a backend developer at the Get app.

