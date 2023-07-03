---
description: 基于 Dubbo Javascript 客户端，开发在浏览器中访问后端服务的 Web 页面
linkTitle: Web
title: 基于 Dubbo Javascript 客户端，开发在浏览器中访问后端服务的 Web 页面
type: docs
weight: 1
---

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo TypeScript SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 APl 来发布或调用这些服务。

本示例演示了基于 Triple 协议的 RPC 通信模式，示例使用 Protocol Buffer 定义 RPC 服务，并演示了代码生成、服务发布和服务访问等过程。本示例完整代码请请参见 [xxx](https://aliyuque.antfin.com/__workers/ken.lj/qt1o6i/pw02wty1pin10eia/a)

## 前置条件

首先，我们将使用 Vite 配置前端。我们使用 Vite 是为了创建一个快速的开发服务器，它内置了我们稍后需要的所有功能支持

```shell
npm create vite@latest -- connect-example --template react-ts
cd connect-example
npm install
```

接下来，让我们根据 ELIZA 的 Protocol Buffer 模式生成一些代码。我们将使用 Buf Schema Registry 的远程包功能。第一个命令告诉 npm 在注册表中查找 [@buf ](/buf ) 包。安装命令会即时生成我们需要的类型

```shell
npm config set @buf:registry https://buf.build/gen/npm/v1
npm install @buf/bufbuild_eliza.bufbuild_connect-es @apache/triple @apache/triple-web
```

## 创建 App

现在我们可以从包中导入服务并设置一个客户端。在 App.tsx 中添加以下内容：

```typescript
import { useState } from "react";
import "./App.css";

import { createPromiseClient } from "@apache/triple";
import { createTripleTransport } from "@apache/triple-web";

// Import service definition that you want to connect to.
import { ElizaService } from "@buf/bufbuild_eliza.bufbuild_connect-es/buf/connect/demo/eliza/v1/eliza_connect";

// The transport defines what type of endpoint we're hitting.
// In our example we'll be communicating with a Connect endpoint.
const transport = createTripleTransport({
  baseUrl: "https://demo.connect.build",
});

// Here we make the client itself, combining the service
// definition with the transport.
const client = createPromiseClient(ElizaService, transport);

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
          <li key={index}>{`${msg.fromMe ? "ME:" : "ELIZA:"} ${msg.message}`}</li>
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

最终得到页面

![](https://connect.build/assets/images/eliza-network-panel-d1fd5b15d80b237c48f672f87b9ba455.png#id=KE683&originHeight=1440&originWidth=2022&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

## 更多内容

- 更多 Dubbo Javascript 特性