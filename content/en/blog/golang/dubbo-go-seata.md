---
title: "Detailed Explanation of the Communication Model of the Distributed Transaction Framework seata-golang"
linkTitle: "Detailed Explanation of the Communication Model of the Distributed Transaction Framework seata-golang"
tags: ["Go", "Ecosystem"]
date: 2021-01-15
description: >
    This article introduces the implementation of the communication model of the seata Go language client.
---

## Introduction

In the Java world, a high-performance network communication framework called Netty is widely used, with many RPC frameworks built on it. In the Go world, Getty is a similar high-performance network communication library. Getty was originally developed by Yu Yu, the project lead of dubbo-go, and is used as a lower-level communication library in dubbo-go. When dubbo-go was donated to the Apache Foundation, Getty eventually became part of the Apache family and was renamed dubbo-getty.

In 2018, I practiced microservices at my company and faced significant issues with distributed transactions. The same year, Alibaba open-sourced their distributed transaction solution, which I quickly took note of, initially called Fescar and later renamed Seata. As I was interested in open-source technologies, I joined many community groups and closely followed the dubbo-go project, quietly absorbing knowledge. As my understanding of Seata grew, I gradually developed the idea of creating a Go version of a distributed transaction framework.

To create a Go version of a distributed transaction framework, one of the first challenges to address is how to implement RPC communication. Dubbo-go presents a good example, prompting a study of the underlying Getty.

## How to Implement RPC Communication Based on Getty

The overall model diagram of the Getty framework is as follows:

![img](/imgs/blog/dubbo-go/seata/p1.webp)

Next, let's detail the RPC communication process of Seata-golang with related code.

### 1. Establishing a Connection

To implement RPC communication, a network connection must first be established, beginning with client.go.

```go
func (c *client) connect() {
  var (
    err error
    ss  Session
  )

  for {
        // Establishing a session connection
    ss = c.dial()
    if ss == nil {
      // Client has been closed
      break
    }
    err = c.newSession(ss)
    if err == nil {
            // Sending and receiving messages
      ss.(*session).run()
      // Omitted parts of the code

      break
    }
    // Don't distinguish between TCP and WebSocket connections. Because
    // gorilla/websocket/conn.go:(Conn)Close also invokes net.Conn.Close()
    ss.Conn().Close()
  }
}
```

The `connect()` method obtains a session connection via the `dial()` method. Now, let's look into `dial()`:

```go
func (c *client) dial() Session {
  switch c.endPointType {
  case TCP_CLIENT:
    return c.dialTCP()
  case UDP_CLIENT:
    return c.dialUDP()
  case WS_CLIENT:
    return c.dialWS()
  case WSS_CLIENT:
    return c.dialWSS()
  }

  return nil
}
```

Focusing on TCP connections, we continue with the `c.dialTCP()` method:

```go
func (c *client) dialTCP() Session {
  var (
    err  error
    conn net.Conn
  )

  for {
    if c.IsClosed() {
      return nil
    }
    if c.sslEnabled {
      if sslConfig, err := c.tlsConfigBuilder.BuildTlsConfig(); err == nil && sslConfig != nil {
        d := &net.Dialer{Timeout: connectTimeout}
        // Establish a secure connection
        conn, err = tls.DialWithDialer(d, "tcp", c.addr, sslConfig)
      }
    } else {
            // Establish a TCP connection
      conn, err = net.DialTimeout("tcp", c.addr, connectTimeout)
    }
    if err == nil && gxnet.IsSameAddr(conn.RemoteAddr(), conn.LocalAddr()) {
      conn.Close()
      err = errSelfConnect
    }
    if err == nil {
            // Return a TCPSession
      return newTCPSession(conn, c)
    }

    log.Infof("net.DialTimeout(addr:%s, timeout:%v) = error:%+v", c.addr, connectTimeout, perrors.WithStack(err))
    <-wheel.After(connectInterval)
  }
}
```

At this point, we understand how Getty establishes a TCP connection and returns a TCPSession.

### 2. Sending and Receiving Messages

So how does it send and receive messages? Returning to the connection method, we see `ss.(*session).run()`. After this line of code, the subsequent operations are simple; we suspect this line's logic includes the messaging logic. We then enter the `run()` method:

```go
func (s *session) run() {
  // Omitted parts of the code

  go s.handleLoop()
  go s.handlePackage()
}
```

Two goroutines are launched: `handleLoop` and `handlePackage`, matching our assumptions. Entering `handleLoop()`:

```go
func (s *session) handleLoop() {
    // Omitted parts of the code

  for {
    select {
    // Omitted parts of the code

    case outPkg, ok = <-s.wQ:
      // Omitted parts of the code

      iovec = iovec[:0]
      for idx := 0; idx < maxIovecNum; idx++ {
        // encode the interface{} type outPkg into binary bytes via s.writer
        pkgBytes, err = s.writer.Write(s, outPkg)
        // Omitted parts of the code

        iovec = append(iovec, pkgBytes)

                // Omitted parts of the code
      }
            // Send these binary bytes out
      err = s.WriteBytesArray(iovec[:]...)
      if err != nil {
        log.Errorf("%s, [session.handleLoop]s.WriteBytesArray(iovec len:%d) = error:%+v",
          s.sessionToken(), len(iovec), perrors.WithStack(err))
        s.stop()
        // break LOOP
        flag = false
      }

    case <-wheel.After(s.period):
      if flag {
        if wsFlag {
          err := wsConn.writePing()
          if err != nil {
            log.Warnf("wsConn.writePing() = error:%+v", perrors.WithStack(err))
          }
        }
                // Regular logic, such as heartbeat
        s.listener.OnCron(s)
      }
    }
  }
}
```

From the above code, we find that the `handleLoop()` method handles the logic for sending messages; the messages that need to be sent by RPC are first encoded into binary bytes by `s.writer` and then sent via the established TCP connection. This `s.writer` corresponds to a Writer interface that must be implemented in the RPC framework.

Continuing to the `handlePackage()` method:

```go
func (s *session) handlePackage() {
    // Omitted parts of the code

  if _, ok := s.Connection.(*gettyTCPConn); ok {
    if s.reader == nil {
      errStr := fmt.Sprintf("session{name:%s, conn:%#v, reader:%#v}", s.name, s.Connection, s.reader)
      log.Error(errStr)
      panic(errStr)
    }

    err = s.handleTCPPackage()
  } else if _, ok := s.Connection.(*gettyWSConn); ok {
    err = s.handleWSPackage()
  } else if _, ok := s.Connection.(*gettyUDPConn); ok {
    err = s.handleUDPPackage()
  } else {
    panic(fmt.Sprintf("unknown type session{%#v}", s))
  }
}
```

Entering the `handleTCPPackage()` method:

```go
func (s *session) handleTCPPackage() error {
    // Omitted parts of the code

  conn = s.Connection.(*gettyTCPConn)
  for {
    // Omitted parts of the code

    bufLen = 0
    for {
      // Check for network timeout condition
      // s.conn.SetReadTimeout(time.Now().Add(s.rTimeout))
            // Receive the package from TCP connection
      bufLen, err = conn.recv(buf)
      // Omitted parts of the code

      break
    }
    // Omitted parts of the code

        // Write the received binary bytes into pkgBuf
    pktBuf.Write(buf[:bufLen])
    for {
      if pktBuf.Len() <= 0 {
        break
      }
            // Decode the received binary package into an RPC message via s.reader
      pkg, pkgLen, err = s.reader.Read(s, pktBuf.Bytes())
      // Omitted parts of the code

      s.UpdateActive()
            // Add the received message to TaskQueue for RPC consumer
      s.addTask(pkg)
      pktBuf.Next(pkgLen)
      // continue to handle case 5
    }
    if exit {
      break
    }
  }

  return perrors.WithStack(err)
}
```

From the logic above, we analyze that the RPC consumer needs to decode the binary package received from the TCP connection into an RPC consumable message, which is achieved by `s.reader`. Therefore, to build the RPC communication layer, we also need to implement the Reader interface corresponding to `s.reader`.

### 3. How to Decouple Network Message Processing Logic from Business Logic

We know that Netty achieved decoupling of underlying network logic and business logic through boss and worker threads. So how does Getty achieve this?

At the end of the `handlePackage()` method, we see that the received message is placed into the method `s.addTask(pkg)`. Let's analyze this further:

```go
func (s *session) addTask(pkg interface{}) {
  f := func() {
    s.listener.OnMessage(s, pkg)
    s.incReadPkgNum()
  }
  if taskPool := s.EndPoint().GetTaskPool(); taskPool != nil {
    taskPool.AddTaskAlways(f)
    return
  }
  f()
}
```

The `pkg` parameter is passed to an anonymous method, which eventually places the task into the `taskPool`. This method is crucial; when I later wrote the seata-golang code, I encountered a snag related to this—this pitfall will be analyzed later.

Next, we look at the definition of `taskPool`:

```go
// NewTaskPoolSimple build a simple task pool
func NewTaskPoolSimple(size int) GenericTaskPool {
  if size < 1 {
    size = runtime.NumCPU() * 100
  }
  return &taskPoolSimple{
    work: make(chan task),
    sem:  make(chan struct{}, size),
    done: make(chan struct{}),
  }
}
```

A buffered channel `sem` of size (default is `runtime.NumCPU() * 100`) is created. Looking at the method `AddTaskAlways(t task)`:

```go
func (p *taskPoolSimple) AddTaskAlways(t task) {
  select {
  case <-p.done:
    return
  default:
  }

  select {
  case p.work <- t:
    return
  default:
  }
  
  select {
  case p.work <- t:
  case p.sem <- struct{}{}:
    p.wg.Add(1)
    go p.worker(t)
  default:
    goSafely(t)
  }
}
```

The tasks added are first consumed by `len(p.sem)` goroutines; if none are free, a temporary goroutine starts to run `t()`. This forms a goroutine pool with `len(p.sem)` goroutines for handling business logic, instead of processing network messages directly, thus achieving decoupling. A pitfall I encountered while writing seata-golang was forgetting to set the taskPool, causing the same goroutine to handle both business and networking logic, leading to blockages.

### 4. Specific Implementation

The code below can be found in getty.go:

```go
// Reader is used to unmarshal a complete pkg from buffer
type Reader interface {
  Read(Session, []byte) (interface{}, int, error)
}

// Writer is used to marshal pkg and write to session
type Writer interface {
  // if @Session is udpGettySession, the second parameter is UDPContext.
  Write(Session, interface{}) ([]byte, error)
}

// ReadWriter interface use for handle application packages
type ReadWriter interface {
  Reader
  Writer
}
```

```go
// EventListener is used to process pkg that received from remote session
type EventListener interface {
  // invoked when session opened
  // If the return error is not nil, @Session will be closed.
  OnOpen(Session) error

  // invoked when session closed.
  OnClose(Session)

  // invoked when got error.
  OnError(Session, error)

  // invoked periodically, its period can be set by (Session)SetCronPeriod
  OnCron(Session)

  // invoked when getty received a package. Pls attention that do not handle long time
  // logic processing in this func. You'd better set the package's maximum length.
  // If the message's length is greater than it, u should should return err in
  // Reader{Read} and getty will close this connection soon.
  //
  // If ur logic processing in this func will take a long time, u should start a goroutine
  // pool(like working thread pool in cpp) to handle the processing asynchronously. Or u
  // can do the logic processing in other asynchronous way.
  // !!!In short, ur OnMessage callback func should return asap.
  //
  // If this is a udp event listener, the second parameter type is UDPContext.
  OnMessage(Session, interface{})
}
```

Through the analysis of the entire Getty code, we can achieve RPC communication by implementing `ReadWriter` to handle RPC message encoding and decoding, and implementing `EventListener` to handle the corresponding logic. Injecting the implementations of `ReadWriter` and `EventListener` into the RPC Client and Server achieves RPC communication.

### 1) Codec Protocol Implementation

The definition of the Seata protocol is shown below:

![img](/imgs/blog/dubbo-go/seata/p2.webp)

In the implementation of the ReadWriter interface `RpcPackageHandler`, the Codec method is called to encode and decode the message body according to the above format:

```go
// Encode the message into binary bytes
func MessageEncoder(codecType byte, in interface{}) []byte {
  switch codecType {
  case SEATA:
    return SeataEncoder(in)
  default:
    log.Errorf("not support codecType, %s", codecType)
    return nil
  }
}

// Decode binary bytes into message body
func MessageDecoder(codecType byte, in []byte) (interface{}, int) {
  switch codecType {
  case SEATA:
    return SeataDecoder(in)
  default:
    log.Errorf("not support codecType, %s", codecType)
    return nil, 0
  }
}
```

### 2) Client-side Implementation

Now, let's look at the client-side implementation of `EventListener` in `RpcRemotingClient`:

```go
func (client *RpcRemoteClient) OnOpen(session getty.Session) error {
  go func() {
    request := protocal.RegisterTMRequest{AbstractIdentifyRequest: protocal.AbstractIdentifyRequest{
      ApplicationId:           client.conf.ApplicationId,
      TransactionServiceGroup: client.conf.TransactionServiceGroup,
    }}
    // After establishing the connection, initiate a request to register TransactionManager with Transaction Coordinator
    _, err := client.sendAsyncRequestWithResponse(session, request, RPC_REQUEST_TIMEOUT)
    if err == nil {
      // Save the connection established with Transaction Coordinator in the connection pool for future use
      clientSessionManager.RegisterGettySession(session)
      client.GettySessionOnOpenChannel <- session.RemoteAddr()
    }
  }()

  return nil
}

// OnError ...
func (client *RpcRemoteClient) OnError(session getty.Session, err error) {
  clientSessionManager.ReleaseGettySession(session)
}

// OnClose ...
func (client *RpcRemoteClient) OnClose(session getty.Session) {
  clientSessionManager.ReleaseGettySession(session)
}

// OnMessage ...
func (client *RpcRemoteClient) OnMessage(session getty.Session, pkg interface{}) {
  log.Info("received message:{%v}", pkg)
  rpcMessage, ok := pkg.(protocal.RpcMessage)
  if ok {
    heartBeat, isHeartBeat := rpcMessage.Body.(protocal.HeartBeatMessage)
    if isHeartBeat && heartBeat == protocal.HeartBeatMessagePong {
      log.Debugf("received PONG from %s", session.RemoteAddr())
    }
  }

  if rpcMessage.MessageType == protocal.MSGTYPE_RESQUEST ||
    rpcMessage.MessageType == protocal.MSGTYPE_RESQUEST_ONEWAY {
    log.Debugf("msgId:%s, body:%v", rpcMessage.Id, rpcMessage.Body)

    // Handle transaction messages, commit or rollback
    client.onMessage(rpcMessage, session.RemoteAddr())
  } else {
    resp, loaded := client.futures.Load(rpcMessage.Id)
    if loaded {
      response := resp.(*getty2.MessageFuture)
      response.Response = rpcMessage.Body
      response.Done <- true
      client.futures.Delete(rpcMessage.Id)
    }
  }
}

// OnCron ...
func (client *RpcRemoteClient) OnCron(session getty.Session) {
  // Send heartbeat
  client.defaultSendRequest(session, protocal.HeartBeatMessagePing)
}
```

The logic `clientSessionManager.RegisterGettySession(session)` will be analyzed later.

### 3) Server-side Transaction Coordinator Implementation

The code can be found in `DefaultCoordinator`:

```go
func (coordinator *DefaultCoordinator) OnOpen(session getty.Session) error {
  log.Infof("got getty_session:%s", session.Stat())
  return nil
}

func (coordinator *DefaultCoordinator) OnError(session getty.Session, err error) {
  // Release TCP connection
  SessionManager.ReleaseGettySession(session)
  session.Close()
  log.Errorf("getty_session{%s} got error{%v}, will be closed.", session.Stat(), err)
}

func (coordinator *DefaultCoordinator) OnClose(session getty.Session) {
  log.Info("getty_session{%s} is closing......", session.Stat())
}

func (coordinator *DefaultCoordinator) OnMessage(session getty.Session, pkg interface{}) {
  log.Debugf("received message:{%v}", pkg)
  rpcMessage, ok := pkg.(protocal.RpcMessage)
  if ok {
    _, isRegTM := rpcMessage.Body.(protocal.RegisterTMRequest)
    if isRegTM {
      // Map TransactionManager information to TCP connection
      coordinator.OnRegTmMessage(rpcMessage, session)
      return
    }

    heartBeat, isHeartBeat := rpcMessage.Body.(protocal.HeartBeatMessage)
    if isHeartBeat && heartBeat == protocal.HeartBeatMessagePing {
      coordinator.OnCheckMessage(rpcMessage, session)
      return
    }

    if rpcMessage.MessageType == protocal.MSGTYPE_RESQUEST ||
      rpcMessage.MessageType == protocal.MSGTYPE_RESQUEST_ONEWAY {
      log.Debugf("msgId:%s, body:%v", rpcMessage.Id, rpcMessage.Body)
      _, isRegRM := rpcMessage.Body.(protocal.RegisterRMRequest)
      if isRegRM {
        // Map ResourceManager information to TCP connection
        coordinator.OnRegRmMessage(rpcMessage, session)
      } else {
        if SessionManager.IsRegistered(session) {
          defer func() {
            if err := recover(); err != nil {
              log.Errorf("Catch Exception while do RPC, request: %v,err: %w", rpcMessage, err)
            }
          }()
          // Handle transaction messages: global transaction registration, branch transaction registration, branch transaction commit, global transaction rollback, etc.
          coordinator.OnTrxMessage(rpcMessage, session)
        } else {
          session.Close()
          log.Infof("close a unhandled connection! [%v]", session)
        }
      }
    } else {
      resp, loaded := coordinator.futures.Load(rpcMessage.Id)
      if loaded {
        response := resp.(*getty2.MessageFuture)
        response.Response = rpcMessage.Body
        response.Done <- true
        coordinator.futures.Delete(rpcMessage.Id)
      }
    }
  }
}

func (coordinator *DefaultCoordinator) OnCron(session getty.Session) {

}
```

`coordinator.OnRegTmMessage(rpcMessage, session)` registers the Transaction Manager, while `coordinator.OnRegRmMessage(rpcMessage, session)` registers the Resource Manager. A detailed analysis will follow.

Messages enter the method `coordinator.OnTrxMessage(rpcMessage, session)`, routed according to the message type code:

```go
switch msg.GetTypeCode() {
  case protocal.TypeGlobalBegin:
    req := msg.(protocal.GlobalBeginRequest)
    resp := coordinator.doGlobalBegin(req, ctx)
    return resp
  case protocal.TypeGlobalStatus:
    req := msg.(protocal.GlobalStatusRequest)
    resp := coordinator.doGlobalStatus(req, ctx)
    return resp
  case protocal.TypeGlobalReport:
    req := msg.(protocal.GlobalReportRequest)
    resp := coordinator.doGlobalReport(req, ctx)
    return resp
  case protocal.TypeGlobalCommit:
    req := msg.(protocal.GlobalCommitRequest)
    resp := coordinator.doGlobalCommit(req, ctx)
    return resp
  case protocal.TypeGlobalRollback:
    req := msg.(protocal.GlobalRollbackRequest)
    resp := coordinator.doGlobalRollback(req, ctx)
    return resp
  case protocal.TypeBranchRegister:
    req := msg.(protocal.BranchRegisterRequest)
    resp := coordinator.doBranchRegister(req, ctx)
    return resp
  case protocal.TypeBranchStatusReport:
    req := msg.(protocal.BranchReportRequest)
    resp := coordinator.doBranchReport(req, ctx)
    return resp
  default:
    return nil
  }
}
```

### 4) Session Manager Analysis

Upon establishing a connection with the Transaction Coordinator, the client saves the connection through `clientSessionManager.RegisterGettySession(session)` into `serverSessions = sync.Map{}`. The map's key is the RemoteAddress obtained from the session, which corresponds to the Transaction Coordinator's address. The value is the session. This way, the client can use the session stored in the map to register the Transaction Manager and Resource Manager with the Transaction Coordinator. The specific code can be found in `getty_client_session_manager.go`.

Once the Transaction Manager and Resource Manager register with the Transaction Coordinator, a connection might be used to send TM messages or RM messages. We identify a connection using the `RpcContext`:

```go
type RpcContext struct {
  Version                 string
  TransactionServiceGroup string
  ClientRole              meta.TransactionRole
  ApplicationId           string
  ClientId                string
  ResourceSets            *model.Set
  Session                 getty.Session
}
```

When transaction messages are received, we need to construct such an RpcContext for subsequent transaction processing logic. Hence, we create the following maps to cache the relationships:

```go
var (
  // session -> transactionRole
  // TM will register before RM, if a session is not the TM registered,
  // it will be the RM registered
  session_transactionroles = sync.Map{}

  // session -> applicationId
  identified_sessions = sync.Map{}

  // applicationId -> ip -> port -> session
  client_sessions = sync.Map{}

  // applicationId -> resourceIds
  client_resources = sync.Map{}
)
```

In this way, both the Transaction Manager and Resource Manager map their relationship with the applicationId, IP, and port to the session in the `client_sessions` map during their registrations to the Transaction Coordinator, caching this mapping for later use of the RpcContext. The implementation of this part differs significantly from the Java version of Seata, and those interested can explore further. The detailed code can be found in `getty_session_manager.go`.

Thus, we have analyzed the entire RPC communication model mechanism of seata-golang.

### Future of seata-golang

Development of seata-golang started in April this year and by August, it had achieved interoperability with Seata Java version 1.2 and implemented AT mode for MySQL databases (automatic coordination for distributed transaction commits and rollbacks). TCC mode has also been realized, with the TC side using MySQL to store data, transforming TC into a stateless application supporting high availability deployment. The following diagram demonstrates the principles of AT mode:

![img](/imgs/blog/dubbo-go/seata/p3.webp)

There is still much work to be done, such as support for the registration center, configuration center integration, protocol interoperability with Seata Java version 1.4, support for other databases, implementation of a Raft Transaction Coordinator, etc. We hope that developers interested in distributed transaction issues can join us in building a comprehensive Go distributed transaction framework. If you have any questions, feel free to scan the QR code to join the group chat【DingTalk Group Number 33069364】:

Additionally, friends interested in dubbo-go are welcome to join the Dubbo-go community DingTalk group (DingTalk Group Number 31363295) to discuss technical issues related to dubbo-go.

### References

- Seata Official: https://seata.io
- Seata Java Version: https://github.com/seata/seata
- Seata-golang Project Address: https://github.com/opentrx/seata-golang
- Seata-golang Go Night Reading Bilibili Share: https://www.bilibili.com/video/BV1oz411e72T

> Author Biography
> 
> **Liu Xiaomin** (GitHub ID dk-lockdown), currently employed at H3C Chengdu branch, proficient in Java/Go, with experience in cloud-native and microservices-related technologies, currently focusing on distributed transactions.
> **Yu Yu** (GitHub @AlexStocks), project lead and community manager of dubbo-go, a programmer with over ten years of experience in server-side infrastructure research and development, has participated in improvements for several well-known projects, including Muduo/Pika/Dubbo/Sentinel-go, and is currently engaged in container orchestration and service mesh work at Ant Financial.
