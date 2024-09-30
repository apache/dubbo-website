---
title: "A Study on Address Registration of Dubbo Network Interfaces"
linkTitle: "A Study on Address Registration of Dubbo Network Interfaces"
tags: ["Java"]
date: 2019-10-01
description: A Study on Address Registration of Dubbo Network Interfaces
---


## 1 How to Choose the Right Network Interface Address

Many people may not know what this article is about. Let me give you a scenario to clarify. In distributed service calls, taking Dubbo as an example, service providers often need to report their IP addresses to the registry for consumers to discover. In most cases, Dubbo works normally, but if you have noticed Dubbo's GitHub issues, you'll see many people reporting: Dubbo Provider registered the wrong IP. If you can immediately think of keywords such as multiple network interfaces, coexistence of internal and external addresses, VPNs, and virtual network interfaces, then I suggest you keep reading this article, as I am interested in these topics as well! So, "how to choose the appropriate network interface address"? Is Dubbo's existing logic sufficient? Let's not rush to answer; instead, let's explore these questions together and by the end, you can form your own opinion.

## 2 How Dubbo Works

Dubbo's logic for obtaining network interface addresses has evolved through various versions, having encountered setbacks and optimizations. We will use the latest version 2.7.2-SNAPSHOT for introduction. While reading the following source code, I encourage you to adopt a questioning mindset. You can obtain the source code from the master branch of Dubbo's GitHub. The logic for obtaining localhost is located in `org.apache.dubbo.common.utils.NetUtils#getLocalAddress0()`

```java
private static InetAddress getLocalAddress0() {
    InetAddress localAddress = null;
    // First attempt to get the IP corresponding to the hostname in /etc/hosts
    localAddress = InetAddress.getLocalHost();
    Optional<InetAddress> addressOp = toValidAddress(localAddress);
    if (addressOp.isPresent()) {
        return addressOp.get();
    }

    // If no suitable IP is found for registration, start polling network interfaces
    Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
    if (null == interfaces) {
        return localAddress;
    }
    while (interfaces.hasMoreElements()) {
        NetworkInterface network = interfaces.nextElement();
        Enumeration<InetAddress> addresses = network.getInetAddresses();
        while (addresses.hasMoreElements()) {
            // Return the first suitable IP for registration
            Optional<InetAddress> addressOp = toValidAddress(addresses.nextElement());
            if (addressOp.isPresent()) {
                return addressOp.get();
            }
        }
    }
    return localAddress;
}
```

Dubbo's logic for selecting the local address roughly consists of two steps:

1. First, it looks for the IP address corresponding to the hostname in the /etc/hosts file; if found, it returns; if not, it moves to step 2.
2. It polls network interfaces to find a suitable IP address; if found, it returns; if not, it returns null. Outside of `getLocalAddress0`, there is an additional logic that registers 127.0.0.1 as the local loopback address if null is returned.

First, let’s emphasize that there isn't a major problem with this logic. Let's analyze some of its details and validate it.

### 2.1 Attempt to Obtain Hostname-Mapped IP

Dubbo first selects the IP corresponding to the hostname. In the source code, this corresponds to `InetAddress.getLocalHost();` When deploying Dubbo applications on *nix systems, you can first use the `hostname` command to obtain the hostname.

```shell
xujingfengdeMacBook-Pro:~ xujingfeng$ hostname
xujingfengdeMacBook-Pro.local
```

Next, configure the IP mapping in the `/etc/hosts` file to verify Dubbo's mechanism; we can freely set an IP address for the hostname.

```
127.0.0.1	localhost
1.2.3.4 xujingfengdeMacBook-Pro.local
```

Next, call `NetUtils.getLocalAddress0()` for verification, the console prints as follows:

```
xujingfengdeMacBook-Pro.local/1.2.3.4
```

### 2.2 Determine Valid IP Addresses

In the logic of `toValidAddress`, Dubbo has the following criteria for determining whether an IP address is valid:

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

It checks compliance with IPv6 or IPv4 address standards. For IPv6 addresses, see the following code:

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

It first retrieves the `java.net.preferIPv6Addresses` parameter, which defaults to false. Given that most applications do not use IPv6 addresses as the preferred registration IP, this issue isn’t major. Next, it determines connectivity through `isReachable`. For example, some network interface addresses might be VPN/virtual network interfaces, which often cannot connect without a configured routing table and can be filtered out.

For IPv4 addresses, see the following code:

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

Comparing the IPv6 determination, we can see an inconsistent situation:

- The logic for IPv4 adds regex validation for IPv4 format, local loopback address checks, and ANYHOST checks.
- The logic for IPv4 lacks connectivity checks present in the IPv6 validation.

As we know, IPv4 defines 127.0.0.1 as the local loopback address, and IPv6 also has a loopback address: 0:0:0:0:0:0:0:1 or represented as ::1. Suggested improvements will be summarized at the end.

### 2.3 Polling Network Interfaces

If the above address retrieval returns null, it enters the logic for polling network interfaces (for example, if hosts do not specify the hostname mapping, or the hostname is configured as 127.0.0.1, it may lead to empty network interface addresses). The code for polling network interfaces is `NetworkInterface.getNetworkInterfaces()`, which involves numerous knowledge points and supports the material for this article. The Dubbo logic is not complex; it performs simple checks and returns the first available IP.

Impatient readers may find it hard to resist the urge to inquire about multiple network interfaces! There may be more than one suitable interface; how does Dubbo handle this? To give Dubbo some credit, why not let the user specify one? First, we must reach a consensus on the scenario of multiple network interfaces to continue this article: we can only **filter out** those “**incorrect**” network interfaces **as much as possible**. It appears that Dubbo treats all network interfaces equally; is there a way to optimize its logic?

Many open-source service governance frameworks frequently encounter issues related to incorrect IP registration on Stack Overflow or their issues. Most problems occur due to polling network interfaces. Since things have come to this point, it's necessary to understand some networking and network interface knowledge to filter out those obviously unsuitable IP addresses for RPC service registration.

## 3 Introduction to Ifconfig

I don’t mean to discourage anyone from the upcoming content, so I deliberately chose this familiar Linux command! For those who complain, “My gosh, it’s 2019 and you’re still using net-tools/ifconfig, try iproute2/ip,” please ignore. Whether you are using Mac or Linux, you can use it to CRUD your network interface configuration.

### 3.1 Common Commands

**Start or shut down a specified network interface:**

```
ifconfig eth0 up
ifconfig eth0 down
```

`ifconfig eth0 up` starts the eth0 network interface; `ifconfig eth0 down` shuts it down. Users logging into Linux servers via SSH should be careful executing these commands to avoid locking themselves out. Otherwise, your next step will involve searching on Google: “How to connect to a Linux server after disabling the eth0 interface.”

**Configure and delete IPv6 addresses for a network interface:**

```
ifconfig eth0 add 33ffe:3240:800:1005::2/64    # Configure IPv6 address for eth0
ifconfig eth0 del 33ffe:3240:800:1005::2/64    # Delete IPv6 address for eth0
```

**Modify MAC address using ifconfig:**

```
ifconfig eth0 hw ether 00:AA:BB:CC:dd:EE
```

**Configure IP address:**

```
[root@localhost ~]# ifconfig eth0 192.168.2.10
[root@localhost ~]# ifconfig eth0 192.168.2.10 netmask 255.255.255.0
[root@localhost ~]# ifconfig eth0 192.168.2.10 netmask 255.255.255.0 broadcast 192.168.2.255
```

**Enable and disable ARP protocol:**

```
ifconfig eth0 arp    # Enable ARP on eth0
ifconfig eth0 -arp   # Disable ARP on eth0
```

**Set maximum transmission unit:**

```
ifconfig eth0 mtu 1500    # Set the maximum packet size to 1500 bytes
```

### 3.2 View Network Interface Information

In an Ubuntu system, run `ifconfig -a` 

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

To prevent hackers from attacking my Linux system, I modified the IP a bit. Please don’t judge someone trying to capitalize on discounts + group purchases of cheap cloud servers. For the detailed interpretation of some network interfaces:

eth0 represents the first network interface, where HWaddr indicates the physical address of the network interface. Currently, the physical address (MAC address) for this interface is 02:42:38:52:70:54.

inet addr represents the IP address of the network interface, which in this case is 10.154.30.130. The broadcast address is Bcast: 172.18.255.255, and the mask address is Mask: 255.255.0.0.

lo represents the loopback address of the host. This is generally used to test a network program without allowing users on the local or external network to view it, running and viewing through the network interface of this host alone. For example, if you specify the HTTPD server to the loopback address, you can access the web site you set up by entering 127.0.0.1 in your browser. However, only you can see it; other hosts or users on the local network cannot.

The first line shows the connection type: Ethernet (for the physical MAC address).

The second line shows the IP address, subnet, and mask of the network interface.

The third line indicates the status: UP (the network interface is on), RUNNING (the cable is plugged in), MULTICAST (supports multicast), MTU:1500 (maximum transmission unit): 1500 bytes (ifconfig does not show DOWN interfaces without -a).

The fourth and fifth lines provide statistics for received and sent data packets.

The seventh line provides statistics for received and sent data in bytes.

What about the two network interfaces, docker0 and tun0? I installed Docker and OpenVPN on my Ubuntu setup. These two could be the main culprits interfering with service registration. Of course, there could also be a second network interface like eth1. What you see in ifconfig -a corresponds to the JDK API: `NetworkInterface.getNetworkInterfaces()`. In summary, there are roughly three interfering factors:

- Virtual network interface addresses led by the Docker bridge, which are quite popular and need to be separately mentioned.
- Virtual network interface addresses represented by TUN/TAP, mainly from VPN scenarios.
- Multi-network interface scenarios represented by eth1; one can install multiple network interfaces if they have the money!

In the following sections, we will separately introduce these scenarios, aiming to give those who have never encountered these issues at least some insight into how they function.

## 4 Interference Factor One: Docker Bridge

Those familiar with Docker should know that it creates a docker0 bridge by default for container instances to connect. If the default bridge is not sufficiently intuitive, we can customize and create a new bridge in bridge mode:

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

By using the docker network command to create a bridge, a corresponding network interface is automatically created. I have only presented the incremental return portion of `ifconfig -a`; we can see an additional network interface, br-a38696dbbe58.

I intentionally differentiated between “bridges” and “network interfaces” and we can use bridge-utils/brctl to view bridge information:

```shell
ubuntu@VM-30-130-ubuntu:~$ sudo brctl show
bridge name	bridge id		STP enabled	interfaces
br-a38696dbbe58		8000.02426eaafd0c	no
docker0		8000.02425845c215	no
```

A bridge is a virtual device only visible through `brctl show`. Once a bridge is created, a corresponding network interface with the same name is automatically created and added to the bridge.

## 5 Interference Factor Two: TUN/TAP Virtual Network Devices

Generally, when we talk about virtual network interfaces or virtual machines, they are mostly associated with TUN/TAP. Most of my readers are Java practitioners; I trust that the content below won't be too advanced. Don’t let unfamiliar terms intimidate you. For those who feel overwhelmed, you can skip sections 5.1 to 5.3 and directly look at practical application in section 5.4.

### 5.1 How Real Network Interfaces Work

![1918847-496d0e96c237f25a](/imgs/blog/network/01.png)

In the above image, **eth0** represents the real network interface present on our host.

The physical network interface represented by **eth0** connects to the external network via a wire. Data packets received by this physical interface are passed to the kernel’s network protocol stack through the **eth0** interface, where the protocol stack further processes these packets.

For erroneous packets, the protocol stack may choose to discard them; for packets not belonging to the host, the protocol stack may choose to forward them. For packets meant for the host that are needed by higher-level applications, the protocol stack informs waiting applications via the **Socket API**.

### 5.2 How TUN Works

![1918847-85ea08bc89d9427e](/imgs/blog/network/02.png)

While ordinary network interfaces transmit and receive packets over wires, **TUN** devices are more specialized because they send and receive packets through a file.

As shown in the image, **tunX** and **eth0** are logically equivalent—**tunX** also represents a network interface, although this interface is simulated by the system through software.

The virtual network interface represented by **tunX** connects to our application via the file /dev/tunX. Each time the application uses a system call like **write** to input data into this file, the data is delivered to the network stack as network layer packets via this virtual interface. The application can also read packets delivered to **tunX** through the file **/dev/tunX** via system calls like **read**.

Additionally, the protocol stack can manipulate the **tunX** virtual network interface like a normal network interface. For instance, you can assign an **IP** address to **tunX**, set up routing, etc. Overall, from the perspective of the protocol stack, **tunX** does not significantly differ from other standard network interfaces. Of course, if you delve into detail, one distinction would be that **tunX** does not possess a **MAC** address—this is understandable since **tunX** only simulates up to the network layer; thus, a **MAC** address holds no meaning. However, for **tapX**, in the eyes of the protocol stack, there is no notable difference from a real network interface.

Feeling dazed? Why must we learn about TUN in this article? Because the VPNs we commonly use are built on TUN/TAP; if we create a VPN based on **TUN** devices using **UDP**, the entire process may look a little like this:

![1918847-ac4155ec7e9489b2](/imgs/blog/network/03.png)

### 5.3 How TAP Works

The **TAP** device operates in the same way as the **TUN** device; the difference lies in the layers they operate on:

1. The **TUN** device functions at the third layer; it only simulates the **IP** layer of the network stack. Through the file **/dev/tunX**, it can sending and receiving **IP** layer packets, but cannot create a bridge with physical network interfaces. Nevertheless, it can still connect to physical network interfaces through layer 3 switching (like **ip_forward**). The address can be set using commands such as `ifconfig`.
2. The **TAP** device functions at the second layer; it delves more deeply than **TUN** and can send and receive **MAC** layer packets through the file **/dev/tapX**, which means it possesses MAC layer functions, can establish a bridge with physical network interfaces, and supports MAC layer broadcasting. Similarly, you can set an **IP** address using `ifconfig`, and if you wish, you can also set a **MAC** address.

Regarding the distinction between the second and third layers mentioned in the article, I'll clarify: the first layer is the physical layer, the second is the data link layer, the third is the network layer, and the fourth is the transport layer.

### 5.4 Practical Application with OpenVPN

OpenVPN is an open-source VPN tool for Linux, through which we can replicate scenarios that affect our choice of network interfaces.

Install OpenVPN:

```shell
sudo apt-get install openvpn
```

Install a TUN device:

```shell
ubuntu@VM-30-130-ubuntu:~$ sudo openvpn --mktun --dev tun0
Mon Apr 29 22:23:31 2019 TUN/TAP device tun0 opened
Mon Apr 29 22:23:31 2019 Persist state set to: ON
```

Install a TAP device:

```shell
ubuntu@VM-30-130-ubuntu:~$ sudo openvpn --mktun --dev tap0
Mon Apr 29 22:24:36 2019 TUN/TAP device tap0 opened
Mon Apr 29 22:24:36 2019 Persist state set to: ON
```

Run `ifconfig -a` to check the network interfaces, showing only the incremental part:

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

This explains why there is a tun0 network interface at the beginning of this article. Here, readers may question whether using ifconfig can also create tap and tun interfaces. Certainly! OpenVPN is a VPN tool that can only create interfaces named tunX/tapX and follows certain regulations, while ifconfig can create arbitrary interfaces that no one recognizes.

## 6 Interference Factor Three: Multiple Network Interfaces

![image-20190429223515625](/imgs/blog/network/04.png)

There's not much to say here; having multiple real network interfaces gives rise to the IP information as shown above.

## 7 Differences on Mac

Although commands like ifconfig are universal across *nux, the displayed information, attributes related to interfaces, and naming conventions vary significantly. For instance, here’s the output of running `ifconfig -a` on my Mac:

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

There’s plenty of information, but I’ll briefly summarize a few key differences:

- The way information is displayed differs, with no statistics on received or sent bytes visible as in Linux.
- The naming of real network interfaces differs: eth0 -> en0
- The naming format for virtual network interfaces differs: tun/tap -> utun

For interpreting these common network interface names, I’ll quote a portion from a Stack Overflow response:

> In arbitrary order of my familiarity / widespread relevance:
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
> Use the "Network" panel in System Preferences to view what network devices "exist" or "can exist" based on the current configuration.
>
> Many VPNs will add additional devices, often "utun#" or "utap#" following [TUN/TAP (L3/L2)](https://en.wikipedia.org/wiki/TUN/TAP) virtual networking devices.
>
> Use `netstat -nr` to see how traffic is currently routed over network devices based on destination.
>
> Interface naming conventions began in BSD and were retained in OS X/macos, with added specifications.

## 8 Improvements for Dubbo

After the exploration, we should have a slightly better understanding of network interfaces. Looking back at Dubbo’s logic for obtaining network interfaces, are there improvements that can be made?

**Dubbo Action 1:**

Maintain consistency in checks between Ipv4 and Ipv6; add connectivity checks for Ipv4, and check for LoopBack and ANYHOST for Ipv6.

**Dubbo Action 2:**

```java
NetworkInterface network = interfaces.nextElement();
if (network.isLoopback() || network.isVirtual() || !network.isUp()) {
    continue;
}
```

The JDK provides the aforementioned API, which we can utilize to filter out certain incorrect network interfaces.

**Dubbo Action 3:**

This article invested considerable space discussing the issues caused by virtual networks represented by Docker and TUN/TAP, which are common influencing factors. Although their names follow a fixed pattern, such as docker0, tunX, tapX, I believe using interface names to filter registration IP is somewhat hacky, so it is not advisable for Dubbo contributors to submit corresponding PRs for these hacky checks, even though it may assist in filtering.

In the case of real multi-network interfaces and the coexistence of internal and external IPs, efforts shouldn’t solely lie on the framework's side; users need to act as well, much like in a relationship—while I can try a bit harder, you must reciprocate so that the story can develop.

**Dubbo User Action 1:**

Users can configure the `/etc/hosts` file to explicitly map the hostname to the IP.

**Dubbo User Action 2:**

Specify the registered IP using startup parameters:

```java
-DDUBBO_IP_TO_REGISTRY=1.2.3.4
```

Users can also specify which network interface the Dubbo service should bind to:

```java
-DDUBBO_IP_TO_BIND=1.2.3.4
```

## 9 References

[TUN/TAP Device Analysis](https://www.jianshu.com/p/09f9375b7fa7)

[what-are-en0-en1-p2p-and-so-on-that-are-displayed-after-executing-ifconfig](https://stackoverflow.com/questions/29958143/what-are-en0-en1-p2p-and-so-on-that-are-displayed-after-executing-ifconfig)
