---
alias:
 - /zh-cn/overview/quickstart/nodejs/
description: 使用轻量的 Node.js SDK 开发 RPC Server 和 Client
linkTitle: Node.js
title: 使用轻量的 Node.js SDK 开发 RPC Server 和 Client
type: docs
weight: 3
---

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo TypeScript SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 APl 来发布或调用这些服务。

本示例演示了基于 Triple 协议的 RPC 通信模式，示例使用 Protocol Buffer 定义 RPC 服务，并演示了代码生成、服务发布和服务访问等过程。本示例完整代码请请参见 [xxx](https://aliyuque.antfin.com/__workers/ken.lj/qt1o6i/pw02wty1pin10eia/a)

## 前置条件

因为使用 Protocol Buffer 的原因，我们首先需要安装相关的代码生成工具，这包括 `buf`、`protoc-gen-es`、`protoc-gen-dubbo-es`、`protobu`、`triple`。

```shell
npm install @bufbuild/buf @bufbuild/protoc-gen-es @bufbuild/protobuf @bufbuild/protoc-gen-connect-es @apache/triple
```

## 定义服务

现在，使用 Protocol Buffer (IDL) 来定义一个 Dubbo 服务。

创建目录，并生成文件

```shell
mkdir -p proto && touch proto/eliza.proto
```

写入内容

```protobuf
syntax = "proto3";

package buf.connect.demo.eliza.v1;

message SayRequest {
  string sentence = 1;
}

message SayResponse {
  string sentence = 1;
}

service ElizaService {
  rpc Say(SayRequest) returns (SayResponse) {}
}
```

这个文件声明了一个叫做 `ElizaService` 的服务，为这个服务定义了 `Say` 方法以及它的请求参数 `SayRequest` 和返回值 `SayResponse`。

## 生成代码

创建 `buf.gen.yaml` 文件，告诉 `Buf` 如何去生成

```yaml
version: v1
plugins:
  - plugin: es
    opt: target=ts
    out: gen
  - plugin: connect-es
    opt: target=ts
    out: gen
```

接下来我们用 buf generate 命令来处理 proto 目录下的文件

```shell
npx buf generate proto
```

运行以上命令后，你应该可以在目标目录中看到以下生成的文件:

```
├── buf.gen.yaml
├── gen
│   ├── eliza_connect.ts
│   └── eliza_pb.ts
├── proto
│   └── eliza.proto
```

## 实现服务

接下来我们就需要添加业务逻辑了，实现 ElizaService ，并将其注册到 TripleRouter 中。

创建 connect.ts 文件

```typescript
import { TripleRouter } from "@apache/triple";
import { ElizaService } from "./gen/eliza_connect";

export default (router: TripleRouter) =>
  // registers buf.connect.demo.eliza.v1.ElizaService
  router.service(ElizaService, {
    // implements rpc Say
    async say(req) {
      return {
        sentence: `You said: ${req.sentence}`,
      };
    },
  });
```

## 启动 Server

Triple 服务可以嵌入到普通的 Node.js 服务器、Next.js、Express 或 Fastify 中。在这里我们将使用 Fastify。让我们安装 Fastify 以及我们为 Fastify 准备的插件

```shell
npm install fastify @apache/triple-fastify
```

创建一个新的 Server，把我们上一步中实现的 `ElizaService` 注册给它，接下来就可以直接
初始化和启动 Server 了，它将在指定的端口接收请求。

```typescript
import { fastify } from "fastify";
import { fastifyTriplePlugin } from "@apache/triple-fastify";
import routes from "./connect";

async function main() {
  const server = fastify();
  await server.register(fastifyTriplePlugin, {
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

最简单方式是使用 HTTP/1.1 POST 请求访问服务，参数则作以标准 JSON 格式作为 HTTP 负载传递。如下是使用 cUR L 命令的访问示例:

```shell
$ curl \
 --header 'Content-Type: application/json' \
 --data '{"sentence": "Hello World"}' \
 http://localhost:8080/buf.connect.demo.eliza.v1.ElizaService/Say
```

也可以使用标准的 Dubbo client 请求服务，我们首先需要从生成代码即 triple-node 包中获取服务代理，为它指定 server 地址并初始化，之后就可以发起起 RPC 调用了。

创建 client.ts 文件。

```typescript
import { createPromiseClient } from "@apache/triple";
import { ElizaService } from "./gen/eliza_connect";
import { createTripleTransport } from "@apache/triple-node";

const transport = createTripleTransport({
  baseUrl: "http://localhost:8080",
  httpVersion: "1.1"
});

async function main() {
  const client = createPromiseClient(ElizaService, transport);
  const res = await client.say({ sentence: "Hello World" });
  console.log(res);
}
void main();
```

运行客户端

```shell
npx tsx client.ts
```

## 更多内容

- 使用 Dubbo Node.js 开发微服务
- 更多 Dubbo Node.js 特性

