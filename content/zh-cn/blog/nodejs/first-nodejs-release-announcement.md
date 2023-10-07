---
title: "Apache Dubbo 首个 Node.js 3.0-alpha 版本正式发布"
linkTitle: "Apache Dubbo 首个 Node.js 3.0-alpha 版本正式发布"
tags: ["node.js", "dubbo-js"]
authors: ["蔡建怿"]
date: 2023-10-07
description: "本文分享了 Dubbo3 Node.js 首个正式版本，演示基于 Triple 协议的 RPC 通信模式，包括代码生成、服务发布和服务访问等过程。"
---
# 关于 Apache Dubbo3
Apache Dubbo 是一款易用、高性能的 WEB 和 RPC 框架，同时为构建企业级微服务提供服务发现、流量治理、可观测、认证鉴权等能力、工具与最佳实践。经过近几年发展，Dubbo3 已在阿里巴巴集团各条业务线实现全面推广，成功取代运行多年的 HSF 框架；同时 Dubbo3 的多语言体系也有了快速发展，目前涵盖的多语言体系有：

- [apache/dubbo](https://github.com/apache/dubbo) (java)
- [apache/dubbo-go](https://github.com/apache/dubbo-go)
- [apache/dubbo-js](https://github.com/apache/dubbo-js) (web、node.js)
- [apache/dubbo-rust](https://github.com/apache/dubbo-rust)

基于 Dubbo3 定义的 **Triple** 协议，你可以轻松编写浏览器、移动端、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Node.js SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

![image.png](/imgs/blog/2023/9/nodejs/img.png)

# 关于 Dubbo3 Node.js 首个发布版
Dubbo-js 项目于 9 月份刚刚发布了支持 Dubbo3 协议的首个 alpha 版本，该项目是 Dubbo3 的 Typescript 版本实现，提供了 Web、Node.js 两种发布包。其中，Web 框架能让开发者直接在浏览器页面访问后端服务，Node.js 则进一步丰富了后端微服务技术栈的选择。当前 Node.js 版本主要是实现了 Triple 协议的完整支持，接下来的版本中，社区将继续完善地址发现、负载均衡等服务治理能力。目前 dubbo-js 项目快速发展中，对参与 apache/dubbo-js 项目感兴趣的开发者，欢迎搜索钉钉群：**29775027779** 加入开发者群组。

# Node.js 微服务开发完整示例

本示例基于最新发布的 Node.js 版本，演示了基于 Triple 协议的 RPC 通信模式，示例使用 Protocol Buffer 定义 RPC 服务，并演示了代码生成、服务发布和服务访问等过程。
## 前置条件

因为使用 Protocol Buffer 的原因，我们首先需要安装相关的代码生成工具，这包括 `@bufbuild/protoc-gen-es`、`@bufbuild/protobuf`、`@apachedubbo/protoc-gen-apache-dubbo-es`、`@apachedubbo/dubbo`。

```shell
npm install @bufbuild/protoc-gen-es @bufbuild/protobuf @apachedubbo/protoc-gen-apache-dubbo-es @apachedubbo/dubbo
```

## 定义服务

现在，使用 Protocol Buffer (IDL) 来定义一个 Dubbo 服务。

创建目录，并生成文件

```shell
mkdir -p proto && touch proto/example.proto
```

写入内容

```protobuf
syntax = "proto3";

package apache.dubbo.demo.example.v1;

message SayRequest {
  string sentence = 1;
}

message SayResponse {
  string sentence = 1;
}

service ExampleService {
  rpc Say(SayRequest) returns (SayResponse) {}
}
```

这个文件声明了一个叫做 `ExampleService` 的服务，为这个服务定义了 `Say` 方法以及它的请求参数 `SayRequest` 和返回值 `SayResponse`。

## 生成代码

创建 gen 目录，做为生成文件放置的目标目录

```
mkdir -p gen
```

运行以下命令，在 gen 目录下生成代码文件

```shell
PATH=$PATH:$(pwd)/node_modules/.bin \
  protoc -I proto \
  --es_out gen \
  --es_opt target=ts \
  --apache-dubbo-es_out gen \
  --apache-dubbo-es_opt target=ts \
  example.proto
```

运行命令后，应该可以在目标目录中看到以下生成的文件:

```
├── gen
│   ├── example_dubbo.ts
│   └── example_pb.ts
├── proto
│   └── example.proto
```

## 实现服务

接下来我们就需要添加业务逻辑了，实现 ExampleService ，并将其注册到 DubboRouter 中。

创建 dubbo.ts 文件

```typescript
import { DubboRouter } from "@apachedubbo/dubbo";
import { ExampleService } from "./gen/example_dubbo";

export default (router: DubboRouter) =>
  // registers apache.dubbo.demo.example.v1
  router.service(ExampleService, {
    // implements rpc Say
    async say(req) {
      return {
        sentence: `You said: ${req.sentence}`,
      };
    },
  }, { serviceGroup: 'dubbo', serviceVersion: '1.0.0' });
```

## 启动 Server

Dubbo 服务可以嵌入到普通的 Node.js 服务器、Next.js、Express 或 Fastify 中。
在这里我们将使用 Fastify，所以让我们安装 Fastify 以及我们为 Fastify 准备的插件。

```shell
npm install fastify @apachedubbo/dubbo-fastify
```

创建 server.ts 文件，新建一个 Server，把上一步中实现的 `ExampleService` 注册给它。
接下来就可以直接初始化和启动 Server 了，它将在指定的端口接收请求。

```typescript
import { fastify } from "fastify";
import { fastifyDubboPlugin } from "@apachedubbo/dubbo-fastify";
import routes from "./dubbo";

async function main() {
  const server = fastify();
  await server.register(fastifyDubboPlugin, {
    routes,
  });
  server.get("/", (_, reply) => {
    reply.type("text/plain");
    reply.send("Hello World!");
  });
  await server.listen({ host: "localhost", port: 8080 });
  console.log("server is listening at", server.addresses());
}

void main();
```

最后，运行代码启动服务

```shell
npx tsx server.ts
```

## 访问服务

最简单方式是使用 HTTP/1.1 POST 请求访问服务，参数则作以标准 JSON 格式作为 HTTP 负载传递。如下是使用 cURL 命令的访问示例:

```shell
curl \
 --header 'Content-Type: application/json' \
 --header 'TRI-Service-Version: 1.0.0' \
 --header 'TRI-Service-group: dubbo' \
 --data '{"sentence": "Hello World"}' \
 http://localhost:8080/apache.dubbo.demo.example.v1.ExampleService/Say
```

也可以使用标准的 Dubbo client 请求服务，我们首先需要从生成代码即 dubbo-node 包中获取服务代理，为它指定 server 地址并初始化，之后就可以发起起 RPC 调用了。

创建 client.ts 文件。

```typescript
import { createPromiseClient } from "@apachedubbo/dubbo";
import { ExampleService } from "./gen/example_dubbo";
import { createDubboTransport } from "@apachedubbo/dubbo-node";

const transport = createDubboTransport({
  baseUrl: "http://localhost:8080",
  httpVersion: "1.1",
});

async function main() {
  const client = createPromiseClient(ExampleService, transport, { serviceVersion: '1.0.0', serviceGroup: 'dubbo' });
  const res = await client.say({ sentence: "Hello World" });
  console.log(res);
}
void main();
```

运行客户端

```shell
npx tsx client.ts
```

# 总结
当前 Node.js 版本主要是实现了 Triple 协议的完整支持，接下来的版本中，社区将继续完善地址发现、负载均衡等服务治理能力。目前 dubbo-js 项目快速发展中，对参与 apache/dubbo-js 项目感兴趣的开发者，欢迎搜索钉钉群：**29775027779** 加入开发者群组。

