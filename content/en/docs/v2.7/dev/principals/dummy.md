---
type: docs
title: " \"Fool-proof\" Design"
linkTitle: "Fool-proof"
weight: 3
---

> http://javatar.iteye.com/blog/804187

Recently I was feeling stupid because I solved too many stupid problems. The service framework is becoming more widely used. Every day, I have to help the endpoint user to resolve problems. Gradually, it is found that most of the problems are configuration errors, or duplicated files or classes, or network failure. So I prepare to add some "fool-proof" design to the further version. It may be very simple, but it is still a little help for troubleshooting speed. I hope that I can throw a brick to attract jade, and everyone can help to come up with more preventive measures to share.

## Check for duplicated jars

The most annoying problem is that, if we have several jars with different version number at the same time, there will be a problem. Imagine that, a new version of the Class A may invoke a old version of the Class B, it's related to the JVM loading order. The problem may encounter occasionally and hard to resolve. So the first, let's try to avoid it. For each jar package, pick a class that will be loaded, check it for duplication for example:

```java
static {  
    Duplicate.checkDuplicate(Xxx.class);  
}  
``` 

Utility class for check duplication：

```java
public final class Duplicate {  
  
    private Duplicate() {}  
  
    public static void checkDuplicate(Class cls) {  
        checkDuplicate(cls.getName().replace('.', '/') + ".class");  
    }  
  
    public static void checkDuplicate(String path) {  
        try {  
            // search from ClassPath
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
            // if there are more than one indicates duplication
            if (files.size() &gt; 1) {  
                logger.error("Duplicate class " + path + " in " + files.size() + " jar " + files);  
            }  
        } catch (Throwable e) { // safe guard
            logger.error(e.getMessage(), e);  
        }  
    }  
  
}  
```

## Check for duplicate configuration files

It is also a frequently encountered problem that the configuration file is loaded incorrectly. Users often complain that they have the right configuration but program says something is wrong. After some troubleshooting, found that the configuration file is not even loaded. Many products put a default configuration file under classpath, if there are several, usually the first one loaded by JVM is effective. In order not to be bothered by such problem, just like checking duplicate jars, add this:

```java
Duplicate.checkDuplicate("xxx.properties"); 
```

## Check for optional configuration

The required configuration is estimated to be checked by everyone, because without it the program may not even start. However, for some optional parameters, some checks should also be made. For example, the service framework allows the service consumers and service providers to be associated with the registry, and allows direct configuring the service provider address to point-to-point direct connect. At this time, the registry address is optional, but if there is no point-to-point direct connect configured, the registry center address must be matched, and this time you have to check accordingly.

## Provide error message with a solution if possible

It's hard to troubleshooting problem with a simple error message which has no detail information. For example, the last time I encountered a "Failed to get session" exception, just the few words. I'm wondering which session is wrong? What is the reason Failed? It makes me crazy, the problem happens in an production environment and it's hard to reproduce. The exception should have some basic context information, such as author info, operation system, failed reason. The best exception information should be given a solution, such as the above: "From 10.20.16.3 to 10.20.130.20:20880 The network is unreachable. Please use telnet 10.20.130.20 20880 to test the network at 10.20.16.3. If it is called across data center, it may be blocked by the firewall. Please contact SA to grant access permission." etc. The above can even judge whether it is cross data center based on IP address. Another example is the spring-web context loading, If spring is not started when getBean, spring will report an error. The error message says: "Please add: `<listener>...<init-param>...`", just copy and paste.  We should learn from it. You can deliberately make a common mistake and see if you can solve the problem yourself by the error message. Or we can write some solution of common problems in error message.

## And also the environment information

Every time an application error occurs, the developer or QA will send the error message and ask the reason. At this time, I will ask some question again, which version is used? Is it a production environment or a development environment? Which registry center? Which project is it? Which machine? And which service? The problem is, some developers or QA can't tell the difference, it waste me a lot of time. So, it is best to log some environment information, we can make a wrapper. Decorate the Logger interface such as:

```java
public void error(String msg, Throwable e) {  
    delegate.error(msg + " on server " + InetAddress.getLocalHost() + " using version " + Version.getVersion(), e);  
}  
```

Utility class for retrieve version：

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
            // search version number from MANIFEST.MF 
            String version = cls.getPackage().getImplementationVersion();  
            if (version == null || version.length() == 0) {  
                version = cls.getPackage().getSpecificationVersion();  
            }  
            if (version == null || version.length() == 0) {  
                // if not found, extract from jar name
                String file = cls.getProtectionDomain().getCodeSource().getLocation().getFile();  
                if (file != null &amp;&amp; file.length() &gt; 0 &amp;&amp; file.endsWith(".jar")) {  
                    Matcher matcher = VERSION_PATTERN.matcher(file);  
                    while (matcher.find() &amp;&amp; matcher.groupCount() &gt; 0) {  
                        version = matcher.group(1);  
                    }  
                }  
            }  
            // return version, return default if null
            return version == null || version.length() == 0 ? defaultVersion : version;  
        } catch (Throwable e) { 
            // ignore exception, return default version
            logger.error(e.getMessage(), e);  
            return defaultVersion;  
        }  
    }  
  
}
```

## Dump before kill 

Every time there is a problem with the production environment, everyone panics. Usually the most direct way is to rollback and restart, to reduce the downtime. So that the scene is destroyed, and it's hard to check the problem afterwards. Some problem is hard to reproduce in development environment and may happen under hard pressure. It is unlikely let the developer or Appops manually backup all the data before. Therefore, it is best to call dump before the kill script to backup automatically and avoid  mistake. Dump script for example:

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
