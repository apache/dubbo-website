---
title: "Dubbo Go Hessian2 v1.7.0"
linkTitle: "dubbo-go-hessian2 v1.7.0"
date: 2021-6-12
weight: 70
description: >
    What's new in Dubbo-go-hessian2 v1.7.0
---

Dubbo-go-hessian2 v1.7.0 has been released. See https://github.com/apache/dubbo-go-hessian2/releases/tag/v1.7.0 for detailed information. Below is a detailed summary of this update.

Additionally, version 1.6.3 changed the attachment type from map[string]string to map[string]interface{}, causing compatibility issues. This part has been reverted. The plan moving forward is to migrate the request/response objects of the Dubbo protocol entirely to the dubbo-go project for iterative modifications. No further changes will be made to the request/response objects in hessian2.

## 1. New Features

### 1.1 add GetStackTrace method into Throwabler and its implements. [#207](https://github.com/apache/dubbo-go-hessian2/pull/207)

When a Go client requests a Java service and an exception is thrown in Java, the corresponding stack trace information is stored in StackTraceElement.

This exception information should ideally be printed in logs for easy troubleshooting from the client side, so the retrieval of StackTraceElement has been added to Throwabler and its subclasses.

Note: There is actually a better way, where all specific exception types include the Throwable struct in java_exception/exception.go. This would simply require adding the GetStackTrace method in Throwable. However, this method requires more testing validation, and the logic change is relatively more complex, though the code would be cleaner. We won't use this method for now.

### 1.2 catch user defined exceptions. [#208](https://github.com/apache/dubbo-go-hessian2/pull/208)

A serialization output method for the Java Exception object has been added in Go:

```go
func JavaException() []byte {
    e := hessian.NewEncoder()
    exception := java_exception.NewException("java_exception")
    e.Encode(exception)
    return e.Buffer()
}
```

An entry point is provided in output/output.go: Add the following function initialization declaration

```go
func init() {
    funcMap["JavaException"] = testfuncs.JavaException
}
```

In the Java code, an invocation has been added to serialize the result of the Go method:

**Note**: Assert.assertEquals cannot directly compare if Exception objects are equal

```java
    /**
     * test java java.lang.Exception object and go java_exception Exception struct
     */
    @Test
    public void testException() {
        Exception exception = new Exception("java_exception");
        Object javaException = GoTestUtil.readGoObject("JavaException");
        if (javaException instanceof Exception) {
            Assert.assertEquals(exception.getMessage(), ((Exception) javaException).getMessage());
        }
    }
```

### 1.3 support java8 time object. [#212](https://github.com/apache/dubbo-go-hessian2/pull/212), [#221](https://github.com/apache/dubbo-go-hessian2/pull/221)

An output method for Java 8 objects has been added in Go:

```go
// test java8 java.time.Year
func Java8TimeYear() []byte {
    e := hessian.NewEncoder()
    year := java8_time.Year{Year: 2020}
    e.Encode(year)
    return e.Buffer()
}
// test java8 java.time.LocalDate
func Java8LocalDate() []byte {
    e := hessian.NewEncoder()
    date := java8_time.LocalDate{Year: 2020, Month: 9, Day: 12}
    e.Encode(date)
    return e.Buffer()
}
```

An entry point is provided in output/output.go: Add function initialization declarations

```go
func init() {
    funcMap["Java8TimeYear"] = testfuncs.Java8TimeYear
    funcMap["Java8LocalDate"] = testfuncs.Java8LocalDate
}
```

The Java code includes calls to serialize the results of the Go methods:

```java
/**
 * test java8 java.time.* object and go java8_time/* struct
 */
@Test
public void testJava8Year() {
    Year year = Year.of(2020);
    Assert.assertEquals(year
            , GoTestUtil.readGoObject("Java8TimeYear"));
    LocalDate localDate = LocalDate.of(2020, 9, 12);
    Assert.assertEquals(localDate, GoTestUtil.readGoObject("Java8LocalDate"));
}
```

### 1.4 support test golang encoding data in java. [#213](https://github.com/apache/dubbo-go-hessian2/pull/213)

In order to better test and validate the hessian library, it was previously supported to test Java serialization data in Golang; now, it adds the capability to test Golang serialization data in Java, achieving bidirectional testing validation.

An output method has been added in Go:

```go
func HelloWorldString() []byte {
    e := hessian.NewEncoder()
    e.Encode("hello world")
    return e.Buffer()
}
```

Register this method in output/output.go

```go
 // add all output func here
 func init() {
     funcMap["HelloWorldString"] = testfuncs.HelloWorldString
}
```

The entry point in output/output.go:

```go
func main() {
    flag.Parse()
    if *funcName == "" {
        _, _ = fmt.Fprintln(os.Stderr, "func name required")
        os.Exit(1)
    }
    f, exist := funcMap[*funcName]
    if !exist {
        _, _ = fmt.Fprintln(os.Stderr, "func name not exist: ", *funcName)
        os.Exit(1)
    }
    defer func() {
        if err := recover(); err != nil {
            _, _ = fmt.Fprintln(os.Stderr, "error: ", err)
            os.Exit(1)
        }
    }()
    if _, err := os.Stdout.Write(f()); err != nil {
        _, _ = fmt.Fprintln(os.Stderr, "call error: ", err)
        os.Exit(1)
    }
    os.Exit(0)
}
```

The Java code includes calls to serialize the results of the Go methods:

```java
public class GoTestUtil {
    public static Object readGoObject(String func) {
        System.out.println("read go data: " + func);
        try {
            Process process = Runtime.getRuntime()
                    .exec("go run output/output.go -func_name=" + func,
                            null,
                            new File(".."));
            int exitValue = process.waitFor();
            if (exitValue != 0) {
                Assert.fail(readString(process.getErrorStream()));
                return null;
            }
            InputStream is = process.getInputStream();
            Hessian2Input input = new Hessian2Input(is);
            return input.readObject();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    private static String readString(InputStream in) throws IOException {
        StringBuilder out = new StringBuilder();
        InputStreamReader reader = new InputStreamReader(in, StandardCharsets.UTF_8);
        char[] buffer = new char[4096];
        int bytesRead;
        while ((bytesRead = reader.read(buffer)) != -1) {
            out.append(buffer, 0, bytesRead);
        }
        return out.toString();
    }
}
```

Adding Java test code:

```java
@Test
public void testHelloWordString() {
    Assert.assertEquals("hello world"
            , GoTestUtil.readGoObject("HelloWorldString"));
}
```

### 1.5 support java.sql.Time & java.sql.Date. [#219](https://github.com/apache/dubbo-go-hessian2/pull/219)

Support for the Java classes java.sql.Time and java.sql.Date has been added, corresponding to hessian.Time and hessian.Date, see https://github.com/apache/dubbo-go-hessian2/pull/219/files for details.

## 2. Enhancement

### 2.1 Export function EncNull. [#225](https://github.com/apache/dubbo-go-hessian2/pull/225)

The hessian.EncNull method has been opened for use in specific user cases.

## 3. Bugfixes

### 3.1 fix enum encode error in request. [#203](https://github.com/apache/dubbo-go-hessian2/pull/203)

Previously, the Dubbo request object did not consider the enum type situation; this PR added a check for the POJOEnum type. See https://github.com/apache/dubbo-go-hessian2/pull/203/files for details.

### 3.2 fix []byte field decoding issue. [#216](https://github.com/apache/dubbo-go-hessian2/pull/216)

Before v1.7.0, if a struct contained a []byte field, it would fail to deserialize and throw the error "error list tag: 0x29". The primary reason for this was treating it as a list; for such situations, it should be handled as binary data.

```go
type Circular struct {
    Num      int
    Previous *Circular
    Next     *Circular
    ResponseDataBytes    []byte // <---- 
}
func (Circular) JavaClassName() string {
    return "com.company.Circular"
}
```

### 3.3 fix decoding error for map in map. [#229](https://github.com/apache/dubbo-go-hessian2/pull/229)

Before v1.7.0, nested maps could not be parsed correctly due to the corresponding map object being treated as a data type but not automatically included in the class reference list. The solution to this issue is to include the map class object into the class reference list. For more details, refer to [#119](https://github.com/apache/dubbo-go-hessian2/issues/119).

### 3.4 fix fields name mismatch in Duration class. [#234](https://github.com/apache/dubbo-go-hessian2/pull/234)

This PR resolves the incorrect field definitions in the Duration object, where it was originally "second/nano" but should be "seconds/nanos".

It also improves the test validation data. Previously, using 0 as test data for int fields was inaccurate since the default value for int types is already 0.
