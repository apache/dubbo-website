---
aliases:
    - /en/docs3-v2/rust-sdk/quick-start/
    - /en/docs3-v2/rust-sdk/quick-start/
description: Develop microservices running on browser pages using dubbo-js.
linkTitle: Access Dubbo Services via Web Browser
title: Access Dubbo Services via Web Browser
type: docs
weight: 1
---

Based on the Triple protocol defined by Dubbo3, you can easily write browser and gRPC compatible RPC services that run on both HTTP/1 and HTTP/2. The [Dubbo TypeScript SDK](https://github.com/apache/dubbo-js/) supports defining services using IDL or language-specific methods, and provides a lightweight API set to publish or invoke these services.

Dubbo-js released its first alpha version supporting the Dubbo3 protocol in September, which can fundamentally change the architecture and communication patterns of microservices' front and back end, allowing you to directly access backend Dubbo RPC services from a browser page or web server.

![dubbo-web.png](/imgs/v3/web/web-1.png)

# Browser Web Application Example

This example demonstrates how to use dubbo-js to develop a web application running in a browser, where the web page will call backend services developed in dubbo node.js to generate page content. This example shows both IDL and non-IDL coding modes.

![dubbo-web.png](/imgs/v3/web/web-2.png)

## IDL Mode

### Prerequisites

First, we will use Vite to generate our frontend project template, which has all the features we need later.

```shell
npm create vite@latest -- dubbo-web-example --template react-ts
cd dubbo-web-example
npm install
```

Because we are using Protocol Buffer, we need to install related code generation tools: `@bufbuild/protoc-gen-es`, `@bufbuild/protobuf`, `@apachedubbo/protoc-gen-apache-dubbo-es`, `@apachedubbo/dubbo`.

```shell
npm install @bufbuild/protoc-gen-es @bufbuild/protobuf @apachedubbo/protoc-gen-apache-dubbo-es @apachedubbo/dubbo
```

### Defining Service with Proto

Now, use Protocol Buffer (IDL) to define a Dubbo service.

Create the util/proto directory under src and generate the file

```shell
mkdir -p src/util/proto && touch src/util/proto/example.proto
```

Write the content

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

This file declares a service called `ExampleService`, defining the `Say` method with its request parameter `SayRequest` and return value `SayResponse`.

### Generate Code

Create the gen directory as the target directory for generated files

```shell
mkdir -p src/util/gen
```

Run the following command to generate code files in the gen directory using `protoc-gen-es`, `protoc-gen-apache-dubbo-es`, and other plugins

```shell
PATH=$PATH:$(pwd)/node_modules/.bin \
  protoc -I src/util/proto \
  --es_out src/util/gen \
  --es_opt target=ts \
  --apache-dubbo-es_out src/util/gen \
  --apache-dubbo-es_opt target=ts \
  example.proto
```

After running the command, you should see the following generated files in the target directory:

```
├── src
│   ├── util
│   │   ├── gen
│   │   │   ├── example_dubbo.ts
│   │   │   └── example_pb.ts
│   │   └── proto
│   │       └── example.proto
```

### Create App

First, download `@apachedubbo/dubbo-web`

```shell
npm install @apachedubbo/dubbo-web
```

Now we can import the service from the package and set a client. Add the following content in App.tsx:

```typescript
import { useState } from "react";
import "./App.css";

import { createPromiseClient } from "@apachedubbo/dubbo";
import { createDubboTransport } from "@apachedubbo/dubbo-web";

// Import service definition that you want to connect to.
import { ExampleService } from "./util/gen/example_dubbo";

// The transport defines what type of endpoint we're hitting.
// In our example we'll be communicating with a Dubbo endpoint.
const transport = createDubboTransport({
  baseUrl: "http://localhost:8080",
});

// Here we make the client itself, combining the service
// definition with the transport.
const client = createPromiseClient(ExampleService, transport, { serviceGroup: 'dubbo', serviceVersion: '1.0.0' });

function App() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<
    {
      fromMe: boolean;
      message: string;
    }[]
  >([]);
  return (
    <>
      <ol>
        {messages.map((msg, index) => (
          <li key={index}>{`${msg.fromMe ? "ME:" : "Dubbo Server:"} ${msg.message}`}</li>
        ))}
      </ol>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          // Clear inputValue since the user has submitted.
          setInputValue("");
          // Store the inputValue in the chain of messages and
          // mark this message as coming from "me"
          setMessages((prev) => [
            ...prev,
            {
              fromMe: true,
              message: inputValue,
            },
          ]);
          const response = await client.say({
            sentence: inputValue,
          });
          setMessages((prev) => [
            ...prev,
            {
              fromMe: false,
              message: response.sentence,
            },
          ]);
        }}
      >
        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

export default App;
```

Run the following command to get the sample page:

```shell
npm run dev
```

### Start Server

Next, we need to start the Server, which can be developed in any language that Dubbo supports, such as Java, Go, or Node.js. Here, we take the Node.js server embedded with Dubbo service; see [Developing Dubbo Backend Service with Node.js](https://github.com/apache/dubbo-js/tree/dubbo3/example/dubbo-node-example) for specific steps.

Please note that we need to additionally modify the Node.js example: introduce `@fastify/cors` to solve the front-end request cross-origin issues

```shell
npm install @fastify/cors
```

We need to modify the server.ts file

```typescript
...
import cors from "@fastify/cors";

...
async function main() {
  const server = fastify();
  ...
  await server.register(cors, {
    origin: true,
  });
  ...
  await server.listen({ host: "localhost", port: 8080 });
  ...
}

void main();
```

Finally, run the code to start the service

```shell
npx tsx server.ts
```

## Non-IDL Mode

In upcoming versions, we will continue to provide support for communication without IDL mode, making it easier to access backend services without IDL. Here, we will quickly look at how to use the non-IDL mode.

You also need to install `@apachedubbo/dubbo` and `@apachedubbo/dubbo-web` first.

```shell
npm install @apachedubbo/dubbo @apachedubbo/dubbo-web
```

Now, you can start a client and initiate a call. The code in App.tsx is basically the same as in IDL mode, with the difference in the following content:

```typescript
// ...
// set backend server to connect
const transport = createDubboTransport({
  baseUrl: "http://localhost:8080",
});
// init client
const client = createPromiseClient(transport);

function App() {
  // ...
  // call remote Dubbo service
  const response = await client.call(
    "apache.dubbo.demo.example.v1.ExampleService",
    "say",
    {
      sentence: inputValue,
    });
}
```

Run the following command to get the sample page:

```shell
npm run dev
```
