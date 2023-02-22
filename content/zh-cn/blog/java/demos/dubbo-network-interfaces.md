---
title: "研究 Dubbo 网卡地址注册时的一点思考"
linkTitle: "研究 Dubbo 网卡地址注册时的一点思考"
tags: ["Java"]
date: 2019-10-01
description: 研究 Dubbo 网卡地址注册时的一点思考
---


## 1 如何选择合适的网卡地址

可能相当一部分人还不知道我这篇文章到底要讲什么，我说个场景，大家应该就明晰了。在分布式服务调用过程中，以 Dubbo 为例，服务提供者往往需要将自身的 IP 地址上报给注册中心，供消费者去发现。在大多数情况下 Dubbo 都可以正常工作，但如果你留意过 Dubbo 的 github issue，其实有不少人反馈：Dubbo Provider 注册了错误的 IP。如果你能立刻联想到：多网卡、内外网地址共存、VPN、虚拟网卡等关键词，那我建议你一定要继续将本文看下去，因为我也想到了这些，它们都是本文所要探讨的东西！那么“如何选择合适的网卡地址”呢，Dubbo 现有的逻辑到底算不算完备？我们不急着回答它，而是带着这些问题一起进行研究，相信到文末，其中答案，各位看官自有评说。

## 2 Dubbo 是怎么做的

Dubbo 获取网卡地址的逻辑在各个版本中也是千回百转，走过弯路，也做过优化，我们用最新的 2.7.2-SNAPSHOT 版本来介绍，在看以下源码时，大家可以怀着质疑的心态去阅读，在 dubbo github 的 master 分支可以获取源码。获取 localhost 的逻辑位于 `org.apache.dubbo.common.utils.NetUtils#getLocalAddress0()` 之中

```java
private static InetAddress getLocalAddress0() {
    InetAddress localAddress = null;
    // 首先尝试获取 /etc/hosts 中 hostname 对应的 IP
    localAddress = InetAddress.getLocalHost();
    Optional<InetAddress> addressOp = toValidAddress(localAddress);
    if (addressOp.isPresent()) {
        return addressOp.get();
    }

    // 没有找到适合注册的 IP，则开始轮询网卡
    Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
    if (null == interfaces) {
        return localAddress;
    }
    while (interfaces.hasMoreElements()) {
        NetworkInterface network = interfaces.nextElement();
        Enumeration<InetAddress> addresses = network.getInetAddresses();
        while (addresses.hasMoreElements()) {
            // 返回第一个匹配的适合注册的 IP
            Optional<InetAddress> addressOp = toValidAddress(addresses.nextElement());
            if (addressOp.isPresent()) {
                return addressOp.get();
            }
        }
    }
    return localAddress;
}
```

Dubbo 这段选取本地地址的逻辑大致分成了两步

1. 先去 /etc/hosts 文件中找 hostname 对应的 IP 地址，找到则返回；找不到则转 2
2. 轮询网卡，寻找合适的 IP 地址，找到则返回；找不到返回 null，在 getLocalAddress0 外侧还有一段逻辑，如果返回 null，则注册 127.0.0.1 这个本地回环地址

首先强调下，这段逻辑并没有太大的问题，先别急着挑刺，让我们来分析下其中的一些细节，并进行验证。

### 2.1 尝试获取 hostname 映射 IP

Dubbo 首先选取的是 hostname 对应的 IP，在源码中对应的 `InetAddress.getLocalHost();`  在 `*nix` 系统实际部署 Dubbo 应用时，可以首先使用 `hostname` 命令获取主机名

```shell
xujingfengdeMacBook-Pro:~ xujingfeng$ hostname
xujingfengdeMacBook-Pro.local
```

紧接着在 `/etc/hosts` 配置 IP 映射，为了验证 Dubbo 的机制，我们随意为 hostname 配置一个 IP 地址

```
127.0.0.1	localhost
1.2.3.4 xujingfengdeMacBook-Pro.local
```

接着调用 `NetUtils.getLocalAddress0()` 进行验证，控制台打印如下：

```
xujingfengdeMacBook-Pro.local/1.2.3.4
```

### 2.2 判定有效的 IP 地址

在 toValidAddress 逻辑中，Dubbo 存在以下逻辑判定一个 IP 地址是否有效

```java
private static Optional<InetAddress> toValidAddress(InetAddress address) {
    if (address instanceof Inet6Address) {
        Inet6Address v6Address = (Inet6Address) address;
        if (isValidV6Address(v6Address)) {
            return Optional.ofNullable(normalizeV6Address(v6Address));
        }
    }
    if (isValidV4Address(address)) {
        return Optional.of(address);
    }
    return Optional.empty();
}
```

依次校验其符合 Ipv6 或者 Ipv4 的 IP 规范，对于 Ipv6 的地址，见如下代码：

```java
static boolean isValidV6Address(Inet6Address address) {
    boolean preferIpv6 = Boolean.getBoolean("java.net.preferIPv6Addresses");
    if (!preferIpv6) {
        return false;
    }
    try {
        return address.isReachable(100);
    } catch (IOException e) {
        // ignore
    }
    return false;
}
```

首先获取 `java.net.preferIPv6Addresses` 参数，其默认值为 false，鉴于大多数应用并没有使用 Ipv6 地址作为理想的注册 IP，这问题不大，紧接着通过 isReachable 判断网卡的连通性。例如一些网卡可能是 VPN/虚拟网卡的地址，如果没有配置路由表，往往无法连通，可以将之过滤。

对于 Ipv4 的地址，见如下代码：

```java
static boolean isValidV4Address(InetAddress address) {
    if (address == null || address.isLoopbackAddress()) {
        return false;
    }
    String name = address.getHostAddress();
    boolean result = (name != null
            && IP_PATTERN.matcher(name).matches()
            && !Constants.ANYHOST_VALUE.equals(name)
            && !Constants.LOCALHOST_VALUE.equals(name));
    return result;
}
```

对比 Ipv6 的判断，这里我们已经发现前后不对称的情况了

- Ipv4 相比 Ipv6 的逻辑多了 Ipv4 格式的正则校验、本地回环地址校验、ANYHOST 校验
- Ipv4 相比 Ipv6 的逻辑少了网卡连通性的校验

大家都知道，Ipv4 将 127.0.0.1 定为本地回环地址， Ipv6 也存在回环地址：0:0:0:0:0:0:0:1 或者表示为 ::1。改进建议也很明显，我们放到文末统一总结。

### 2.3 轮询网卡

如果上述地址获取为 null 则进入轮询网卡的逻辑（例如 hosts 未指定 hostname 的映射或者 hostname 配置成了 127.0.0.1 之类的地址便会导致获取到空的网卡地址），轮询网卡对应的源码是 `NetworkInterface.getNetworkInterfaces()` ，这里面涉及的知识点就比较多了，支撑起了我写这篇文章的素材，Dubbo 的逻辑并不复杂，进行简单的校验，返回第一个可用的 IP 即可。

性子急的读者可能忍不住了，多网卡！合适的网卡可能不止一个，Dubbo 怎么应对呢？按道理说，我们也替 Dubbo 说句公道话，客官要不你自己指定下？我们首先得对多网卡的场景达成一致看法，才能继续把这篇文章完成下去：我们只能**尽可能**过滤那些“**不对**”的网卡。Dubbo 看样子对所有网卡是一视同仁了，那么是不是可以尝试优化一下其中的逻辑呢？

许多开源的服务治理框架在 stackoverflow 或者其 issue 中，注册错 IP 相关的问题都十分高频，大多数都是轮询网卡出了问题。既然事情发展到这儿，势必需要了解一些网络、网卡的知识，我们才能过滤掉那些明显不适合 RPC 服务注册的 IP 地址了。

## 3 Ifconfig 介绍

我并没有想要让大家对后续的内容望而却步，特地选择了这个大家最熟悉的 Linux 命令！对于那些吐槽：“天呐，都 2019 年了，你怎么还在用 net-tools/ifconfig，iproute2/ip 了解一下”的言论，请大家视而不见。无论你使用的是 mac，还是 linux，都可以使用它去 CRUD 你的网卡配置。

### 3.1 常用指令

**启动关闭指定网卡：**

```
ifconfig eth0 up
ifconfig eth0 down
```

`ifconfig eth0 up` 为启动网卡 eth0，`ifconfig eth0 down` 为关闭网卡 eth0。ssh 登陆 linux 服务器操作的用户要小心执行这个操作了，千万不要蠢哭自己。不然你下一步就需要去 google：“禁用 eth0 网卡后如何远程连接 Linux 服务器” 了。

**为网卡配置和删除IPv6地址：**

```
ifconfig eth0 add 33ffe:3240:800:1005::2/64    #为网卡eth0配置IPv6地址
ifconfig eth0 del 33ffe:3240:800:1005::2/64    #为网卡eth0删除IPv6地址
```

**用 ifconfig 修改 MAC 地址：**

```
ifconfig eth0 hw ether 00:AA:BB:CC:dd:EE
```

**配置 IP 地址：**

```
[root@localhost ~]# ifconfig eth0 192.168.2.10
[root@localhost ~]# ifconfig eth0 192.168.2.10 netmask 255.255.255.0
[root@localhost ~]# ifconfig eth0 192.168.2.10 netmask 255.255.255.0 broadcast 192.168.2.255
```

**启用和关闭arp协议：**

```
ifconfig eth0 arp    #开启网卡eth0 的arp协议
ifconfig eth0 -arp   #关闭网卡eth0 的arp协议
```

**设置最大传输单元：**

```
ifconfig eth0 mtu 1500    #设置能通过的最大数据包大小为 1500 bytes
```

### 3.2 查看网卡信息

在一台 ubuntu 上执行 `ifconfig -a` 

```shell
ubuntu@VM-30-130-ubuntu:~$ ifconfig -a
eth0      Link encap:Ethernet  HWaddr 52:54:00:a9:5f:ae
          inet addr:10.154.30.130  Bcast:10.154.63.255  Mask:255.255.192.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:149673 errors:0 dropped:0 overruns:0 frame:0
          TX packets:152271 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:15205083 (15.2 MB)  TX bytes:21386362 (21.3 MB)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
          
docker0   Link encap:Ethernet  HWaddr 02:42:58:45:c1:15
          inet addr:172.17.0.1  Bcast:172.17.255.255  Mask:255.255.0.0
          UP BROADCAST MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

tun0      Link encap:UNSPEC  HWaddr 00-00-00-00-00-00-00-00-00-00-00-00-00-00-00-00
          UP POINTOPOINT NOARP MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:100
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

为了防止黑客对我的 Linux 发起攻击，我还是偷偷对 IP 做了一点“改造”，请不要为难一个趁着打折+组团购买廉价云服务器的小伙子。对于部分网卡的详细解读:

eth0 表示第一块网卡， 其中 HWaddr 表示网卡的物理地址，可以看到目前这个网卡的物理地址(MAC 地址）是 02:42:38:52:70:54

inet addr 用来表示网卡的 IP 地址，此网卡的 IP 地址是 10.154.30.130，广播地址， Bcast: 172.18.255.255，掩码地址 Mask:255.255.0.0 

lo 是表示主机的回环地址，这个一般是用来测试一个网络程序，但又不想让局域网或外网的用户能够查看，只能在此台主机上运行和查看所用的网络接口。比如把 HTTPD 服务器的指定到回坏地址，在浏览器输入 127.0.0.1 就能看到你所架构的 WEB 网站了。但只有你能看得到，局域网的其它主机或用户则无从知晓。

第一行：连接类型：Ethernet（以太网）HWaddr（硬件mac地址）

第二行：网卡的IP地址、子网、掩码

第三行：UP（代表网卡开启状态）RUNNING（代表网卡的网线被接上）MULTICAST（支持组播）MTU:1500（最大传输单元）：1500字节（ifconfig 不加 -a 则无法看到 DOWN 的网卡）

第四、五行：接收、发送数据包情况统计

第七行：接收、发送数据字节数统计信息。

紧接着的两个网卡 docker0，tun0 是怎么出来的呢？我在我的 ubuntu 上装了 docker 和 openvpn。这两个东西应该是日常干扰我们做服务注册时的罪魁祸首了，当然，也有可能存在 eth1 这样的第二块网卡。ifconfig -a 看到的东西就对应了 JDK 的 api ：`NetworkInterface.getNetworkInterfaces()` 。我们简单做个总结，大致有三个干扰因素

- 以 docker 网桥为首的虚拟网卡地址，毕竟这东西这么火，怎么也得单独列出来吧？
- 以 TUN/TAP 为代表的虚拟网卡地址，多为 VPN 场景
- 以 eth1 为代表的多网卡场景，有钱就可以装多网卡了！

我们后续的篇幅将针对这些场景做分别的介绍，力求让大家没吃过猪肉，起码看下猪怎么跑的。

## 4 干扰因素一：Docker 网桥

熟悉 docker 的朋友应该知道 docker 会默认创建一个 docker0 的网桥，供容器实例连接。如果嫌默认的网桥不够直观，我们可以使用 bridge 模式自定义创建一个新的网桥：

```shell
ubuntu@VM-30-130-ubuntu:~$ docker network create kirito-bridge
a38696dbbe58aa916894c674052c4aa6ab32266dcf6d8111fb794b8a344aa0d9
ubuntu@VM-30-130-ubuntu:~$ ifconfig -a
br-a38696dbbe58 Link encap:Ethernet  HWaddr 02:42:6e:aa:fd:0c
          inet addr:172.19.0.1  Bcast:172.19.255.255  Mask:255.255.0.0
          UP BROADCAST MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

使用 docker network 指令创建网桥之后，自动创建了对应的网卡，我只给出了 `ifconfig -a` 的增量返回部分，可以看出多了一个 br-a38696dbbe58 的网卡。

我有意区分了“网桥”和“网卡”，可以使用 bridge-utils/brctl 来查看网桥信息：

```shell
ubuntu@VM-30-130-ubuntu:~$ sudo brctl show
bridge name	bridge id		STP enabled	interfaces
br-a38696dbbe58		8000.02426eaafd0c	no
docker0		8000.02425845c215	no
```

网桥是一个虚拟设备，这个设备只有 brctl show 能看到，网桥创建之后，会自动创建一个同名的网卡，并将这个网卡加入网桥。

## 5 干扰因素二：TUN/TAP 虚拟网络设备

平时我们所说的虚拟网卡、虚拟机，大致都跟 TUN/TAP 有关。我的读者大多数是 Java 从业者，相信我下面的内容并没有太超纲，不要被陌生的名词唬住。对于被唬住的读者，也可以直接跳过 5.1~5.3，直接看 5.4 的实战。

### 5.1 真实网卡工作原理

![1918847-496d0e96c237f25a](/imgs/blog/network/01.png)

上图中的 **eth0** 表示我们主机已有的真实的网卡接口 (**interface**)。

网卡接口 **eth0** 所代表的真实网卡通过网线(**wire**)和外部网络相连，该物理网卡收到的数据包会经由接口 **eth0** 传递给内核的网络协议栈(**Network Stack**)。然后协议栈对这些数据包进行进一步的处理。

对于一些错误的数据包,协议栈可以选择丢弃；对于不属于本机的数据包，协议栈可以选择转发；而对于确实是传递给本机的数据包,而且该数据包确实被上层的应用所需要，协议栈会通过 **Socket API** 告知上层正在等待的应用程序。

### 5.2 TUN 工作原理

![1918847-85ea08bc89d9427e](/imgs/blog/network/02.png)

我们知道，普通的网卡是通过网线来收发数据包的话，而 **TUN** 设备比较特殊，它通过一个文件收发数据包。

如上图所示，**tunX** 和上面的 **eth0** 在逻辑上面是等价的， **tunX** 也代表了一个网络接口,虽然这个接口是系统通过软件所模拟出来的.

网卡接口 **tunX 所代表的虚拟网卡通过文件 /dev/tunX 与我们的应用程序(App)相连**，应用程序每次使用 **write** 之类的系统调用将数据写入该文件，这些数据会以网络层数据包的形式，通过该虚拟网卡，经由网络接口 **tunX** 传递给网络协议栈，同时该应用程序也可以通过 **read** 之类的系统调用，经由文件 **/dev/tunX** 读取到协议栈向 **tunX** 传递的**所有**数据包。

此外，协议栈可以像操纵普通网卡一样来操纵 **tunX** 所代表的虚拟网卡。比如说，给 **tunX** 设定 **IP** 地址，设置路由，总之，在协议栈看来，**tunX** 所代表的网卡和其他普通的网卡区别不大，当然，硬要说区别，那还是有的,那就是 **tunX** 设备不存在 **MAC** 地址，这个很好理解，**tunX** 只模拟到了网络层，要 **MAC**地址没有任何意义。当然，如果是 **tapX** 的话，在协议栈的眼中，**tapX** 和真实网卡没有任何区别。

是不是有些懵了？我是谁，为什么我要在这篇文章里面学习 TUN！因为我们常用的 VPN 基本就是基于 TUN/TAP 搭建的，如果我们使用 **TUN** 设备搭建一个基于 **UDP** 的 **VPN** ，那么整个处理过程可能是这幅样子：

![1918847-ac4155ec7e9489b2](/imgs/blog/network/03.png)

### 5.3 TAP 工作原理

**TAP** 设备与 **TUN** 设备工作方式完全相同，区别在于：

1.  **TUN** 设备是一个三层设备，它只模拟到了 **IP** 层，即网络层 我们可以通过 **/dev/tunX** 文件收发 **IP** 层数据包，它无法与物理网卡做 **bridge**，但是可以通过三层交换（如  **ip_forward**）与物理网卡连通。可以使用`ifconfig`之类的命令给该设备设定 **IP** 地址。
2.  **TAP** 设备是一个二层设备，它比 **TUN** 更加深入，通过 **/dev/tapX** 文件可以收发 **MAC** 层数据包，即数据链路层，拥有 **MAC** 层功能，可以与物理网卡做 **bridge**，支持 **MAC** 层广播。同样的，我们也可以通过`ifconfig`之类的命令给该设备设定 **IP** 地址，你如果愿意，我们可以给它设定 **MAC** 地址。

关于文章中出现的二层，三层，我这里说明一下，第一层是物理层，第二层是数据链路层，第三层是网络层，第四层是传输层。

### 5.4 openvpn 实战

openvpn 是 Linux 上一款开源的 vpn 工具，我们通过它来复现出影响我们做网卡选择的场景。

安装 openvpn

```shell
sudo apt-get install openvpn
```

安装一个 TUN 设备：

```shell
ubuntu@VM-30-130-ubuntu:~$ sudo openvpn --mktun --dev tun0
Mon Apr 29 22:23:31 2019 TUN/TAP device tun0 opened
Mon Apr 29 22:23:31 2019 Persist state set to: ON
```

安装一个 TAP 设备：

```shell
ubuntu@VM-30-130-ubuntu:~$ sudo openvpn --mktun --dev tap0
Mon Apr 29 22:24:36 2019 TUN/TAP device tap0 opened
Mon Apr 29 22:24:36 2019 Persist state set to: ON
```

执行 `ifconfig -a` 查看网卡，只给出增量的部分：

```shell
tap0      Link encap:Ethernet  HWaddr 7a:a2:a8:f1:6b:df
          BROADCAST MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:100
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

tun0      Link encap:UNSPEC  HWaddr 00-00-00-00-00-00-00-00-00-00-00-00-00-00-00-00
          inet addr:10.154.30.131  P-t-P:10.154.30.131  Mask:255.255.255.255
          UP POINTOPOINT NOARP MULTICAST  MTU:1500  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:100
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

这样就解释了文章一开始为什么会有 tun0 这样的网卡了。这里读者可能会有疑惑，使用 ifconfig 不是也可以创建 tap 和 tun 网卡吗？当然啦，openvpn 是一个 vpn 工具，只能创建名为 tunX/tapX 的网卡，其遵守着一定的规范，ifconfig 可以随意创建，但没人认那些随意创建的网卡。

## 6 干扰因素三：多网卡

![image-20190429223515625](/imgs/blog/network/04.png)

这个没有太多好说的，有多张真实的网卡，从普哥那儿搞到如上的 IP 信息。

## 7 MAC 下的差异

虽然 ifconfig 等指令是 `*nux` 通用的，但是其展示信息，网卡相关的属性和命名都有较大的差异。例如这是我 MAC 下执行 `ifconfig -a` 的返回：

```shell
xujingfengdeMacBook-Pro:dubbo-in-action xujingfeng$ ifconfig -a
lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384
	options=1203<RXCSUM,TXCSUM,TXSTATUS,SW_TIMESTAMP>
	inet 127.0.0.1 netmask 0xff000000
	inet6 ::1 prefixlen 128
	inet6 fe80::1%lo0 prefixlen 64 scopeid 0x1
	nd6 options=201<PERFORMNUD,DAD>
gif0: flags=8010<POINTOPOINT,MULTICAST> mtu 1280
stf0: flags=0<> mtu 1280
XHC0: flags=0<> mtu 0
XHC20: flags=0<> mtu 0
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	ether 88:e9:fe:88:a0:76
	inet6 fe80::1cab:f689:60d1:bacb%en0 prefixlen 64 secured scopeid 0x6
	inet 30.130.11.242 netmask 0xffffff80 broadcast 30.130.11.255
	nd6 options=201<PERFORMNUD,DAD>
	media: autoselect
	status: active
p2p0: flags=8843<UP,BROADCAST,RUNNING,SIMPLEX,MULTICAST> mtu 2304
	ether 0a:e9:fe:88:a0:76
	media: autoselect
	status: inactive
awdl0: flags=8943<UP,BROADCAST,RUNNING,PROMISC,SIMPLEX,MULTICAST> mtu 1484
	ether 66:d2:8c:8c:dd:85
	inet6 fe80::64d2:8cff:fe8c:dd85%awdl0 prefixlen 64 scopeid 0x8
	nd6 options=201<PERFORMNUD,DAD>
	media: autoselect
	status: active
en1: flags=8963<UP,BROADCAST,SMART,RUNNING,PROMISC,SIMPLEX,MULTICAST> mtu 1500
	options=60<TSO4,TSO6>
	ether aa:00:d0:13:0e:01
	media: autoselect <full-duplex>
	status: inactive
en2: flags=8963<UP,BROADCAST,SMART,RUNNING,PROMISC,SIMPLEX,MULTICAST> mtu 1500
	options=60<TSO4,TSO6>
	ether aa:00:d0:13:0e:00
	media: autoselect <full-duplex>
	status: inactive
bridge0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	options=63<RXCSUM,TXCSUM,TSO4,TSO6>
	ether aa:00:d0:13:0e:01
	Configuration:
		id 0:0:0:0:0:0 priority 0 hellotime 0 fwddelay 0
		maxage 0 holdcnt 0 proto stp maxaddr 100 timeout 1200
		root id 0:0:0:0:0:0 priority 0 ifcost 0 port 0
		ipfilter disabled flags 0x2
	member: en1 flags=3<LEARNING,DISCOVER>
	        ifmaxaddr 0 port 9 priority 0 path cost 0
	member: en2 flags=3<LEARNING,DISCOVER>
	        ifmaxaddr 0 port 10 priority 0 path cost 0
	nd6 options=201<PERFORMNUD,DAD>
	media: <unknown type>
	status: inactive
utun0: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 2000
	inet6 fe80::3fe0:3e8b:384:9968%utun0 prefixlen 64 scopeid 0xc
	nd6 options=201<PERFORMNUD,DAD>
utun1: flags=8051<UP,POINTOPOINT,RUNNING,MULTICAST> mtu 1380
	inet6 fe80::7894:3abc:5abd:457d%utun1 prefixlen 64 scopeid 0xd
	nd6 options=201<PERFORMNUD,DAD>  
```

内容很多，我挑几点差异简述下：

- 内容展示形式不一样，没有 Linux 下的接收、发送数据字节数等统计信息

- 真实网卡的命名不一样：eth0 -> en0
- 虚拟网卡的命名格式不一样：tun/tap -> utun

对于这些常见网卡命名的解读，我摘抄一部分来自 stackoverflow 的回答：

> In arbitrary order of my familarity / widespread relevance:
>
> `lo0` is loopback.
>
> `en0` at one point "ethernet", now is WiFi (and I have no idea what extra `en1` or `en2` are used for).
>
> `fw0` is the FireWire network interface.
>
> `stf0` is an [IPv6 to IPv4 tunnel interface](https://www.freebsd.org/cgi/man.cgi?gif(4)) to support [the transition](http://en.wikipedia.org/wiki/6to4) from IPv4 to the IPv6 standard.
>
> `gif0` is a more [generic tunneling interface](https://www.freebsd.org/cgi/man.cgi?gif(4)) [46]-to-[46].
>
> `awdl0` is [Apple Wireless Direct Link](https://stackoverflow.com/questions/19587701/what-is-awdl-apple-wireless-direct-link-and-how-does-it-work)
>
> `p2p0` is related to AWDL features. Either as an old version, or virtual interface with different semantics than `awdl`.
>
> the "Network" panel in System Preferences to see what network devices "exist" or "can exist" with current configuration.
>
> many VPNs will add additional devices, often "utun#" or "utap#" following [TUN/TAP (L3/L2)](https://en.wikipedia.org/wiki/TUN/TAP)virtual networking devices.
>
> use `netstat -nr` to see how traffic is currently routed via network devices according to destination.
>
> interface naming conventions started in BSD were retained in OS X / macOS, and now there also additions.

## 8 Dubbo 改进建议

我们进行了以上探索，算是对网卡有一点了解了。回过头来看看 Dubbo 获取网卡的逻辑，是否可以做出改进呢？

**Dubbo Action 1:** 

保持 Ipv4 和 Ipv6 的一致性校验。为 Ipv4 增加连通性校验；为 Ipv6 增加 LoopBack 和 ANYHOST 等校验。

**Dubbo Action 2:** 

```java
NetworkInterface network = interfaces.nextElement();
if (network.isLoopback() || network.isVirtual() || !network.isUp()) {
    continue;
}
```

JDK 提供了以上的 API，我们可以利用起来，过滤一部分一定不正确的网卡。

**Dubbo Action 3:** 

我们本文花了较多的篇幅介绍了 docker 和 TUN/TAP 两种场景导致的虚拟网卡的问题，算是较为常见的一个影响因素，虽然他们的命名具有固定性，如 docker0、tunX、tapX，但我觉得通过网卡名称的判断方式去过滤注册 IP 有一些 hack，所以不建议 dubbo contributor 提出相应的 pr 去增加这些 hack 判断，尽管可能会对判断有所帮助。

对于真实多网卡、内外网 IP 共存的场景，不能仅仅是框架侧在做努力，用户也需要做一些事，就像爱情一样，我可以主动一点，但你也得反馈，才能发展出故事。

**Dubbo User Action 1:**

可以配置 `/etc/hosts` 文件，将 hostname 对应的 IP 显式配置进去。

**Dubbo User Action 2:**

可以使用启动参数去显式指定注册的 IP：

```java
-DDUBBO_IP_TO_REGISTRY=1.2.3.4
```

也可以指定 Dubbo 服务绑定在哪块网卡上：

```java
-DDUBBO_IP_TO_BIND=1.2.3.4
```

## 9 参考文章

[TUN/TAP 设备浅析](https://www.jianshu.com/p/09f9375b7fa7)

[what-are-en0-en1-p2p-and-so-on-that-are-displayed-after-executing-ifconfig](https://stackoverflow.com/questions/29958143/what-are-en0-en1-p2p-and-so-on-that-are-displayed-after-executing-ifconfig)