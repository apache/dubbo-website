---
aliases:
    - /en/overview/quickstart/nodejs/
    - /en/overview/quickstart/nodejs/
description: Develop backend microservices using Node.js
linkTitle: Quick Start
title: Quick Start
type: docs
weight: 1
---

Based on the Triple protocol defined by Dubbo, you can easily write browser and gRPC compatible RPC services that run simultaneously on HTTP/1 and HTTP/2. The Dubbo Node.js SDK supports defining services using IDL or language-specific methods and provides a lightweight API for publishing or invoking these services.

This example demonstrates the RPC communication model based on the Triple protocol, using Protocol Buffers to define RPC services, and illustrating processes such as code generation, service publishing, and service access.

## <span id="precondition">Preconditions</span>

Due to the use of Protocol Buffers, we first need to install the relevant code generation tools, including `@bufbuild/protoc-gen-es`, `@bufbuild/protobuf`, `@apachedubbo/protoc-gen-apache-dubbo-es`, `@apachedubbo/dubbo`.

```Shell
npm install @bufbuild/protoc-gen-es @bufbuild/protobuf @apachedubbo/protoc-gen-apache-dubbo-es @apachedubbo/dubbo
```

## <span id="defineService">Define Service</span>

Now, use Protocol Buffers (IDL) to define a Dubbo service.

Create a directory and generate a file.

```Shell
mkdir -p proto && touch proto/example.proto
```

Write the content.

```Protobuf
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

This file declares a service called `ExampleService`, defining a `Say` method along with its request parameter `SayRequest` and return value `SayResponse`.

## <span id="generateCode">Generate Code</span>

Create a gen directory as the target directory for generated files.

```
mkdir -p gen
```

Run the following command to generate code files in the gen directory.

```Shell
PATH=$PATH:$(pwd)/node_modules/.bin \
  protoc -I proto \
  --es_out gen \
  --es_opt target=ts \
  --apache-dubbo-es_out gen \
  --apache-dubbo-es_opt target=ts \
  example.proto
```

After running the command, you should see the following generated files in the target directory:

```Plain Text
├── gen
│   ├── example_dubbo.ts
│   └── example_pb.ts
├── proto
│   └── example.proto
```

## <span id="implementService">Implement Service</span>

Next, we'll need to add business logic to implement ExampleService and register it with DubboRouter.

Create a dubbo.ts file.

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

## <span id="startServer">Start Server</span>

Dubbo services can be embedded into a regular Node.js server, Next.js, Express, or Fastify. Here we will use Fastify, so let's install Fastify and the plugin we prepared for Fastify.

```Shell
npm install fastify @apachedubbo/dubbo-fastify
```

Create a server.ts file, create a Server, and register the implemented `ExampleService` from the previous step. Then initialize and start the Server, which will receive requests on the specified port.

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

Finally, run the code to start the service.

```Shell
npx tsx server.ts
```

## <span id="accessService">Access Service</span>

The simplest way to access the service is to use an HTTP/1.1 POST request, passing parameters in standard JSON format as the HTTP payload. Below is an example using the cURL command:

```Shell
curl \
 --header 'Content-Type: application/json' \
 --header 'TRI-Service-Version: 1.0.0' \
 --header 'TRI-Service-group: dubbo' \
 --data '{"sentence": "Hello World"}' \
 http://localhost:8080/apache.dubbo.demo.example.v1.ExampleService/Say
```

You can also use a standard Dubbo client to request the service. We first need to get the service proxy from the generated code, i.e., the dubbo-node package, specify the server address for it, and initialize it before we can make the RPC call.

Create a client.ts file.

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

Run the client.

```Shell
npx tsx client.ts
```

