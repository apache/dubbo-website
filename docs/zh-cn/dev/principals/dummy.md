# 防痴呆设计

> http://javatar.iteye.com/blog/804187

最近有点痴呆，因为解决了太多的痴呆问题。服务框架实施面超来超广，已有 50 多个项目在使用，每天都要去帮应用查问题，来来回回，发现大部分都是配置错误，或者重复的文件或类，或者网络不通等，所以准备在新版本中加入防痴呆设计。估且这么叫吧，可能很简单，但对排错速度还是有点帮助，希望能抛砖引玉，也希望大家多给力，想出更多的防范措施共享出来。

## 检查重复的jar包 

最痴呆的问题，就是有多个版本的相同jar包，会出现新版本的 A 类，调用了旧版本的 B 类，而且和JVM加载顺序有关，问题带有偶然性，误导性，遇到这种莫名其妙的问题，最头疼，所以，第一条，先把它防住，在每个 jar 包中挑一个一定会加载的类，加上重复类检查，给个示例：

```java
static {  
    Duplicate.checkDuplicate(Xxx.class);  
}  
``` 

检查重复工具类：

```java
public final class Duplicate {  
  
    private Duplicate() {}  
  
    public static void checkDuplicate(Class cls) {  
        checkDuplicate(cls.getName().replace('.', '/') + ".class");  
    }  
  
    public static void checkDuplicate(String path) {  
        try {  
            // 在ClassPath搜文件  
            Enumeration urls = Thread.currentThread().getContextClassLoader().getResources(path);  
            Set files = new HashSet();  
            while (urls.hasMoreElements()) {  
                URL url = urls.nextElement();  
                if (url != null) {  
                    String file = url.getFile();  
                    if (file != null &amp;&amp; file.length() &gt; 0) {  
                        files.add(file);  
                    }  
                }  
            }  
            // 如果有多个，就表示重复  
            if (files.size() &gt; 1) {  
                logger.error("Duplicate class " + path + " in " + files.size() + " jar " + files);  
            }  
        } catch (Throwable e) { // 防御性容错  
            logger.error(e.getMessage(), e);  
        }  
    }  
  
}  
```

## 检查重复的配置文件 

配置文件加载错，也是经常碰到的问题。用户通常会和你说：“我配置的很正确啊，不信我发给你看下，但就是报错”。然后查一圈下来，原来他发过来的配置根本没加载，平台很多产品都会在 classpath 下放一个约定的配置，如果项目中有多个，通常会取JVM加载的第一个，为了不被这么低级的问题折腾，和上面的重复jar包一样，在配置加载的地方，加上：

```java
Duplicate.checkDuplicate("xxx.properties"); 
```

## 检查所有可选配置

必填配置估计大家都会检查，因为没有的话，根本没法运行。但对一些可选参数，也应该做一些检查，比如：服务框架允许通过注册中心关联服务消费者和服务提供者，也允许直接配置服务提供者地址点对点直连，这时候，注册中心地址是可选的，但如果没有配点对点直连配置，注册中心地址就一定要配，这时候也要做相应检查。

## 异常信息给出解决方案 

在给应用排错时，最怕的就是那种只有简单的一句错误描述，啥信息都没有的异常信息。比如上次碰到一个 Failed to get session 异常，就这几个单词，啥都没有，哪个 session 出错? 什么原因 Failed? 看了都快疯掉，因是线上环境不好调试，而且有些场景不是每次都能重现。异常最基本要带有上下文信息，包括操作者，操作目标，原因等，最好的异常信息，应给出解决方案，比如上面可以给出："从 10.20.16.3 到 10.20.130.20:20880 之间的网络不通，请在 10.20.16.3 使用 telnet 10.20.130.20 20880 测试一下网络，如果是跨机房调用，可能是防火墙阻挡，请联系 SA 开通访问权限" 等等，上面甚至可以根据 IP 段判断是不是跨机房。另外一个例子，是 spring-web 的 context 加载，如果在 getBean 时 spring 没有被启动，spring 会报一个错，错误信息写着：请在 web.xml 中加入: `<listener>...<init-param>...`，多好的同学，看到错误的人复制一下就完事了，我们该学学。可以把常见的错误故意犯一遍，看看错误信息能否自我搞定问题， 
或者把平时支持应用时遇到的问题及解决办法都写到异常信息里。 

## 日志信息包含环境信息 

每次应用一出错，应用的开发或测试就会把出错信息发过来，询问原因，这时候我都会问一大堆套话，用的哪个版本呀？是生产环境还是开发测试环境？哪个注册中心呀？哪个项目中的？哪台机器呀？哪个服务? 累啊，最主要的是，有些开发或测试人员根本分不清，没办法，只好提供上门服务，浪费的时间可不是浮云，所以，日志中最好把需要的环境信息一并打进去，最好给日志输出做个包装，统一处理掉，免得忘了。包装Logger接口如： 

```java
public void error(String msg, Throwable e) {  
    delegate.error(msg + " on server " + InetAddress.getLocalHost() + " using version " + Version.getVersion(), e);  
}  
```

获取版本号工具类：

```java
public final class Version {  
  
    private Version() {}  
  
    private static final Logger logger = LoggerFactory.getLogger(Version.class);  
  
    private static final Pattern VERSION_PATTERN = Pattern.compile("([0-9][0-9\\.\\-]*)\\.jar");  
  
    private static final String VERSION = getVersion(Version.class, "2.0.0");  
  
    public static String getVersion(){  
        return VERSION;  
    }  
  
    public static String getVersion(Class cls, String defaultVersion) {  
        try {  
            // 首先查找MANIFEST.MF规范中的版本号  
            String version = cls.getPackage().getImplementationVersion();  
            if (version == null || version.length() == 0) {  
                version = cls.getPackage().getSpecificationVersion();  
            }  
            if (version == null || version.length() == 0) {  
                // 如果MANIFEST.MF规范中没有版本号，基于jar包名获取版本号  
                String file = cls.getProtectionDomain().getCodeSource().getLocation().getFile();  
                if (file != null &amp;&amp; file.length() &gt; 0 &amp;&amp; file.endsWith(".jar")) {  
                    Matcher matcher = VERSION_PATTERN.matcher(file);  
                    while (matcher.find() &amp;&amp; matcher.groupCount() &gt; 0) {  
                        version = matcher.group(1);  
                    }  
                }  
            }  
            // 返回版本号，如果为空返回缺省版本号  
            return version == null || version.length() == 0 ? defaultVersion : version;  
        } catch (Throwable e) { // 防御性容错  
            // 忽略异常，返回缺省版本号  
            logger.error(e.getMessage(), e);  
            return defaultVersion;  
        }  
    }  
  
}
```

## kill 之前先 dump 

每次线上环境一出问题，大家就慌了，通常最直接的办法回滚重启，以减少故障时间，这样现场就被破坏了，要想事后查问题就麻烦了，有些问题必须在线上的大压力下才会发生，线下测试环境很难重现，不太可能让开发或 Appops 在重启前，先手工将出错现场所有数据备份一下，所以最好在 kill 脚本之前调用 dump，进行自动备份，这样就不会有人为疏忽。dump脚本示例：

```sh
JAVA_HOME=/usr/java  
OUTPUT_HOME=~/output  
DEPLOY_HOME=`dirname $0`  
HOST_NAME=`hostname`  
  
DUMP_PIDS=`ps  --no-heading -C java -f --width 1000 | grep "$DEPLOY_HOME" |awk '{print $2}'`  
if [ -z "$DUMP_PIDS" ]; then  
    echo "The server $HOST_NAME is not started!"  
    exit 1;  
fi  
  
DUMP_ROOT=$OUTPUT_HOME/dump  
if [ ! -d $DUMP_ROOT ]; then  
    mkdir $DUMP_ROOT  
fi  
  
DUMP_DATE=`date +%Y%m%d%H%M%S`  
DUMP_DIR=$DUMP_ROOT/dump-$DUMP_DATE  
if [ ! -d $DUMP_DIR ]; then  
    mkdir $DUMP_DIR  
fi  
  
echo -e "Dumping the server $HOST_NAME ...\c"  
for PID in $DUMP_PIDS ; do  
    $JAVA_HOME/bin/jstack $PID > $DUMP_DIR/jstack-$PID.dump 2>&1  
    echo -e ".\c"  
    $JAVA_HOME/bin/jinfo $PID > $DUMP_DIR/jinfo-$PID.dump 2>&1  
    echo -e ".\c"  
    $JAVA_HOME/bin/jstat -gcutil $PID > $DUMP_DIR/jstat-gcutil-$PID.dump 2>&1  
    echo -e ".\c"  
    $JAVA_HOME/bin/jstat -gccapacity $PID > $DUMP_DIR/jstat-gccapacity-$PID.dump 2>&1  
    echo -e ".\c"  
    $JAVA_HOME/bin/jmap $PID > $DUMP_DIR/jmap-$PID.dump 2>&1  
    echo -e ".\c"  
    $JAVA_HOME/bin/jmap -heap $PID > $DUMP_DIR/jmap-heap-$PID.dump 2>&1  
    echo -e ".\c"  
    $JAVA_HOME/bin/jmap -histo $PID > $DUMP_DIR/jmap-histo-$PID.dump 2>&1  
    echo -e ".\c"  
    if [ -r /usr/sbin/lsof ]; then  
    /usr/sbin/lsof -p $PID > $DUMP_DIR/lsof-$PID.dump  
    echo -e ".\c"  
    fi  
done  
if [ -r /usr/bin/sar ]; then  
/usr/bin/sar > $DUMP_DIR/sar.dump  
echo -e ".\c"  
fi  
if [ -r /usr/bin/uptime ]; then  
/usr/bin/uptime > $DUMP_DIR/uptime.dump  
echo -e ".\c"  
fi  
if [ -r /usr/bin/free ]; then  
/usr/bin/free -t > $DUMP_DIR/free.dump  
echo -e ".\c"  
fi  
if [ -r /usr/bin/vmstat ]; then  
/usr/bin/vmstat > $DUMP_DIR/vmstat.dump  
echo -e ".\c"  
fi  
if [ -r /usr/bin/mpstat ]; then  
/usr/bin/mpstat > $DUMP_DIR/mpstat.dump  
echo -e ".\c"  
fi  
if [ -r /usr/bin/iostat ]; then  
/usr/bin/iostat > $DUMP_DIR/iostat.dump  
echo -e ".\c"  
fi  
if [ -r /bin/netstat ]; then  
/bin/netstat > $DUMP_DIR/netstat.dump  
echo -e ".\c"  
fi  
echo "OK!"
```
