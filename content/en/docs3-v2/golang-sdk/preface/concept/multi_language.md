---
type: docs
title: Multilingual RPC
keywords: multilingual RPC
---


![img](/imgs/docs3-v2/golang-sdk/concept/rpc/multi_language/dubbogo-3.0-invocation.png)

### Cross-language call

With the wide-scale application of microservice scenarios, multi-language scenarios are becoming more and more common, and developers are more willing to use more suitable languages to implement different modules of a complex system. For example, use C to write gateways, use Go to write K8S resource operators, and use Java to write business applications. Languages and scenarios are not bound. Enterprises can often choose the appropriate language by combining their own technology stack and the expertise of developers.

In multilingual scenarios, the ability to call across languages is very important.

Cross-language capability is essentially the capability provided by [[Network Protocol]](../protocol/). How to conveniently allow users to use the required network protocols, develop for appropriate cross-language scenarios, and enjoy the service governance capabilities of the Dubbo ecosystem are the concerns of the Dubbo-go service framework.

### Cross Ecology

The Dubbo-go service framework provides cross-ecology capabilities. Developers can use Dubbo-go and its [ecology project](../../../refer/ecology/) to build HTTP/front-end services, Dubbo/Spring applications , The connection between gRPC ecological applications.