---
title: "Dubbo Go Getty Development Log"
linkTitle: "Getty Development Log"
tags: ["Go"]
date: 2021-01-11
description: This article records the journey of Yu Yu developing the dubbo-go networking library Getty.
---

### 0 Introduction

[Getty][3] is a networking layer engine implemented in Go, capable of handling TCP/UDP/websocket protocols.

In June 2016, while working on an instant messaging project in Shanghai, the lower-level network driver at the interface layer was initially written by my colleague [sanbit](https://github.com/sanbit). The original network layer implemented a TCP Server, modeled after the well-known Netty framework. At that time, this engine was quite simple. As I made improvements to this project, this network layer engine evolved alongside it (adding TCP Client, abstracting TCP connection and TCP session). By August 2016 (after adding websocket), it had diverged significantly from the original implementation, and with the consent of the original author and relevant leadership, it was put on GitHub.

Over nearly two years, I continuously improved it, and as my age increases, my memory fades. I feel it is necessary to document some of the problems and solutions encountered during development for future reference.

### 1 UDP Connection

On March 5, 2018, UDP support was added to Getty.

#### 1.1 UDP Connect

UDP itself is divided into unconnected UDP and connected UDP. The underlying principle of connected UDP is shown in the diagram below.

![img](/imgs/blog/dubbo-go/connected_udp_socket.gif)

When one end of a UDP endpoint calls connect, the OS will link the UDP socket with the address of the other endpoint in the internal routing table. A unidirectional connection quadruple is established on the endpoint that initiates the connect: the datagram packet can only be sent to this endpoint (regardless of whether an address is specified during sendto) and can only receive UDP datagram packets sent by this endpoint (as shown in the diagram, packets from others will be discarded by the OS).

When a UDP endpoint initiates a connect, the OS does not perform a TCP-style three-way handshake. The operating system only records the peer UDP endpoint address of the UDP socket and then understands that it returns, simply checking whether the peer address exists in the network.

Whether the other UDP endpoint is a connected UDP is irrelevant, so this is termed a unidirectional connection. If the designated endpoint does not exist or there is no process listening on the port, the peer will return an ICMP "port unreachable" error after sending.

In a POSIX system, if a process initiates a UDP write without specifying the peer UDP address, it will receive an ENOTCONN error instead of EDESTADDRREQ.

![img](/imgs/blog/dubbo-go/dns_udp.gif)

Typically, the UDP client initiates the connect, a typical scenario being the DNS system where the DNS client connects to the DNS server specified in /etc/resolv.conf.

The case where the UDP server initiates the connect occurs in TFTP, and both UDP client and server require long-term communication, meaning both need to connect to become connected UDP.

If a connected UDP needs to change the peer endpoint address, it can simply connect again.

#### 1.2 Performance of Connected UDP

The advantages of connected UDP are detailed in reference document 1. Assuming there are two datagrams to send, the sending process for unconnected UDP is as follows:

* Connect the socket
* Output the first datagram
* Disconnect the socket
* Connect the socket
* Output the second datagram
* Disconnect the socket

Every time a packet is sent, connect is needed. The operating system checks the routing table cache to see if this destination address is the same as the last one; if not, it has to modify the routing table.

The two sending processes for connected UDP are as follows:

* Connect the socket
* Output first datagram
* Output second datagram

In this case, the kernel only sets the virtual link's peer address during the first setup, allowing for continuous sending afterward. Thus, the sending process of connected UDP reduces waiting time by 1/3.

On May 7, 2017, I conducted performance tests between the two using a Python program (`https://github.com/alexStocks/python-practice/blob/master/tcp_udp_http_ws/udp/client.py`). The tests showed that when sending 100,000 UDP datagram packets with the client and server both deployed locally, connected UDP saved 2/13 of the time compared to unconnected UDP.

Another conclusion of this test was that whether connected UDP or unconnected UDP, enabling SetTimeout increases sending delays.

#### 1.3 Go UDP

Go language UDP programming clearly distinguishes between connected and unconnected UDP, as noted in reference document 2, which details how to use the related APIs. Based on this document, I also wrote a program (`https://github.com/alexstocks/go-practice/blob/master/udp-tcp-http/udp/connected-udp.go`) to test these APIs. The testing conclusions are as follows:

* The read and write methods for connected UDP are Read and Write;
* The read and write methods for unconnected UDP are ReadFromUDP and WriteToUDP (as well as ReadFrom and WriteTo);
* Unconnected UDP can call Read, but cannot obtain the peer addr;
* Connected UDP can call ReadFromUDP (the filled address will be ignored);
* Connected UDP cannot call WriteToUDP, "even with the same target address"; otherwise, it results in the error "use of WriteTo with pre-connected connection";
* Unconnected UDP cannot call Write, "because it does not know the target address", error: "write: destination address required smallnestMBP:udp smallnest";
* Connected UDP can call WriteMsgUDP, but the address must be nil;
* Unconnected UDP can call WriteMsgUDP, but must fill in the peer endpoint address.

In conclusion, reads consistently use ReadFromUDP, and writes use WriteMsgUDP.

#### 1.4 Getty UDP

Version v0.8.1 of Getty added support for connected UDP, and its connection function dialUDP (`https://github.com/alexstocks/getty/blob/master/client.go#L141`) simply calls the net.DialUDP function. This caused a peculiar phenomenon during testing on March 18, 2018: after closing the peer UDP endpoint, the local UDP endpoint returned success when connecting, and when checking with the lsof command, it confirmed the existence of this single connection:

	COMMAND     PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
	echo_clie 31729 alex    9u  IPv4 0xa5d288135c97569d      0t0  UDP localhost:63410->localhost:10000

Then, when the net.UDPConn executed a read operation, it received the error "read: connection refused".

Thus, I modified the approach for determining TCP client connect success in C language for dialUDP (`https://github.com/alexstocks/getty/blob/master/client.go#L141`):

* After net.DialUDP success, check if it’s a self-connection; if so, exit;
* Connected UDP sends a useless datagram packet ["ping" string, which will be discarded by the peer due to being an incorrect datagram]; failure exits;
* Connected UDP initiates a read operation; if the peer returns "read: connection refused," it exits; otherwise, it's considered a connectivity success.

### 2 Compression

Last year, I added TCP/Websocket compression support to Getty, using the [gorilla/websocket](https://github.com/gorilla/websocket/) library for websockets. The [Go official website](https://godoc.org/golang.org/x/net/websocket) also recommends this library because it currently lacks some features.

#### 2.1 TCP Compression

Recently, while testing Websocket compression, I found the CPU quickly reached 100%, and the program panicked shortly after startup.

Based on the panic information, I traced back to `gorilla/websocket/conn.go:ReadMsg` function calling `gorilla/websocket/conn.go:NextReader` which then immediately panicked and exited. The `superficial reason` for the panic was easy to identify:

* `gorrilla/websocket:Conn::advanceFrame` encountered a read timeout error (io timeout);
* `gorrilla/websocket:ConnConn.readErr` recorded this error;
* `gorilla/websocket/conn.go:Conn::NextReader` checks this error before starting to read, and if it previously encountered an error, it skips reading the websocket frame and accumulates the count of `gorrilla/websocket:ConnConn.readErr`;
* When the count of `gorrilla/websocket:ConnConn.readErr` exceeds 1000, the program panics and exits.

However, the reason for the read timeout remained unclear.

During testing of TCP compression on March 7, 2018, I found that after starting compression, the program's CPU also quickly reached 100%. Further investigation revealed that in the function `getty/conn.go:gettyTCPConn::read` (`https://github.com/alexstocks/getty/blob/master/conn.go#L228`), there were many "io timeout" errors. At that time, I was confused by this error because I already set a timeout before the TCP read [SetReadDeadline], meaning did starting compression cause the timeout setting to fail and the socket became non-blocking?

Thus, I added a logic in `getty/conn.go:gettyTCPConn::read` (`https://github.com/alexstocks/getty/blob/master/conn.go#L228`): when enabling TCP compression, no longer set the timeout [by default, TCP connection is permanently blocking], and the CPU 100% issue was quickly resolved.

As to why `enabling TCP compression causes SetDeadline to fail and the socket turns non-blocking`, due to personal ability and energy constraints, I will add updates here once the results are traced in the future.

#### 2.2 Websocket Compression

After resolving the TCP compression issue, I speculated that the Websocket compression program might encounter issues related to `enabling TCP compression causes SetDeadline to fail and the socket becomes non-blocking`.

Learning from TCP's solution, in `getty/conn.go:gettyWSConn::read` (`https://github.com/alexstocks/getty/blob/master/conn.go#L527`), I directly disabled the timeout setting. The CPU 100% issue was resolved, and the program operated normally.

### <a name="3">3 Unix Socket</a>

This section is unrelated to Getty, merely recording some key points encountered during the use of Unix sockets.

#### 3.1 Reliable

Unix socket datagrams are also reliable, requiring each write to correspond to a read; otherwise, the writer is blocked. If it is stream-based, the writer won't be blocked until the buffer is full. The advantage of datagrams is their simple API.

> Unix sockets are reliable. If the reader doesn't read, the writer blocks. If the socket is a datagram socket, each write is paired with a read. If the socket is a stream socket, the kernel may buffer some bytes between the writer and the reader, but when the buffer is full, the writer will block. Data is never discarded, except for buffered data if the reader closes the connection before reading the buffer. ---[Do UNIX Domain Sockets Overflow?](https://unix.stackexchange.com/questions/283323/do-unix-domain-sockets-overflow)

> On most UNIX implementations, UNIX domain datagram sockets are always reliable and don’t reorder datagrams. ---[man 7 socketpair](http://www.man7.org/linux/man-pages/man7/unix.7.html)

#### 3.2 Buffer Size

The maximum length of a single datagram packet for datagram-type Unix sockets is 130688 B.

> AF_UNIX SOCK_DATAGRAM/SOCK_SEQPACKET datagrams need contiguous memory. Contiguous physical memory is hard to find, and the allocation fails. The max size actually is 130688 B. --- [the max size of AF_UNIX datagram message that can be sent in linux](https://stackoverflow.com/questions/4729315/what-is-the-max-size-of-af-unix-datagram-message-that-can-be-sent-in-linux)

> It looks like AF_UNIX sockets don't support scatter/gather on current Linux. it is a fixed size 130688 B. --- [Difference between UNIX domain STREAM and DATAGRAM sockets?](https://stackoverflow.com/questions/13953912/difference-between-unix-domain-stream-and-datagram-sockets)

### <a name="4">4 Goroutine Pool</a>

As [dubbogo/getty][1] is used as the underlying TCP transport engine by [apache/dubbo-go][2], in order to improve system throughput, [dubbogo/getty][1] faces the requirement for the next evolution: [**to further optimize the network I/O and thread dispatch for dubbo-go and Getty**][4]. The key is to add a Goroutine Pool [hereafter referred to as gr pool] to separate network I/O and logical processing.

The Gr Pool consists of a task queue [with count M] and a Gr array [with count N], along with tasks [or messages]. Depending on the number of N, it can be divided into scalable or fixed sizes. The benefit of a scalable Gr Pool is that it can increase or decrease N as the number of tasks changes to save CPU and memory resources, but it is generally not commonly used, as I previously created one and it lies dormant in my [github repo][5].

[dubbogo/getty][1] only focuses on a fixed-size N gr pool and does not consider the processing order after receiving packets. For instance, if [dubbogo/getty][1] server receives two network packets A and B from the client, a gr pool model that ignores processing order may cause the client to receive the response for B first, followed by A.

If each of the client's requests are independent with no order relationships, it is fine for [dubbogo/getty][1]’s gr pool to ignore order. If the upper layer user cares about the processing order of requests A and B, they can combine A and B into one request or disable the gr pool feature.

### <a name="4.1">4.1 Fixed-size Gr Pool</a>

Based on the ratio of M to N, the fixed-size Gr Pool is further classified into three types: 1:1, 1:N, and M:N.

The 1:N type Gr Pool is the easiest to implement. In 2017, I implemented this type of [Gr Pool][7] in the project [kafka-connect-elasticsearch][6]: as a consumer reading data from Kafka and then placing it into the message queue, each worker gr takes out tasks from this queue for processing.

When adding a gr pool to [dubbogo/getty][1], I also implemented this version of the [gr pool][8]. This model's gr pool only creates a single chan; all gr read from this one chan. The downside is that it has a one-writer-multiple-reader model due to the lower efficiency of Go channels [which overall use a mutex lock], resulting in fierce contention, and obviously, there’s no guarantee on the order of processed network packets.

The initial version of the [gr pool][9] in [dubbogo/getty][1] was 1:1, where each gr had its own chan. This read-write model is one-write-one-read, and its advantage is that it guarantees the order of processing network packets, as messages from Kafka can be delivered to a specific task queue based on the hash value of Kafka message keys using the modulus method [hash(message key) % N], thus ensuring that messages with the same key are processed in order. However, Wong pointed out the deficiencies of this model: since each task processing takes time, some gr's chan may be blocked, rendering other idle gr incapable of processing [task processing "starvation"].

[wenwei86][12] proposed a further improvement to the 1:1 model: each gr has a chan, and if a gr finds that its chan has no requests, it looks for requests in other chans, while senders aim to send to faster-consuming goroutines. This scheme resembles the MPG scheduling algorithm inside the Go runtime, but personally, I find both the algorithm and implementation too complicated, hence I did not adopt it.

Currently, [dubbogo/getty][1] utilizes an M:N model version of the [gr pool][11], where each task queue is consumed by N/M grs. The advantage of this model is that it strikes a balance between processing efficiency and lock pressure, achieving a balanced overall task processing. In this version, Task dispatch uses a Round Robin method.

## Conclusion

This article summarizes some of the issues encountered during the recent development of [Getty][3]. Due to personal limitations, I can only present my best solutions thus far [if you have better implementations, please leave a comment].

As [Getty][3] has new improvements or features, I will update this article accordingly.

This is recorded.

## References

1. Connect Function with UDP (`http://www.masterraghu.com/subjects/np/introduction/unix_network_programming_v1.3/ch08lev1sec11.html`)
2. [In-depth Go UDP Programming](http://colobu.com/2016/10/19/Go-UDP-Programming/)

> 1: https://github.com/dubbogo/getty
> 
> 2: https://github.com/apache/dubbo-go/
> 
> 3: https://github.com/alexstocks/getty
> 
> 4: https://www.oschina.net/question/3820517_2306822
> 
> 5: https://github.com/alexstocks/goext/blob/master/sync/pool/worker_pool.go
> 
> 6: https://github.com/AlexStocks/kafka-connect-elasticsearch
> 
> 7: https://github.com/AlexStocks/kafka-connect-elasticsearch/blob/master/app/worker.go
> 
> 8: https://github.com/dubbogo/getty/pull/6/commits/4b32c61e65858b3eea9d88d8f1c154ab730c32f1
> 
> 9: https://github.com/dubbogo/getty/pull/6/files/c4d06e2a329758a6c65c46abe464a90a3002e428#diff-9922b38d89e2ff9f820f2ce62f254162
> 
> 10: https://github.com/wongoo
> 
> 11: https://github.com/dubbogo/getty/pull/6/commits/1991056b300ba9804de0554dbb49b5eb04560c4b
> 
> 12: https://github.com/wenweihu86

