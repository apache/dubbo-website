---
aliases:
    - /en/overview/reference/proposals/protocol-http/
description: This article will introduce the REST/HTTP protocol design of Dubbo.
linkTitle: Rest Protocol
title: Rest Protocol
type: docs
weight: 1
---
This article will introduce the REST/HTTP protocol design of Dubbo.

## RestProtocol Design

### Original Version Dubbo Rest

**consumer**

restClient supports relying on resteasy and does not support spring mvc.

**provider (heavier)**

Depends on web container (tomcat, jetty), servlet mode, jaxrs netty server.

### New Version Dubbo Rest

Lighter, with a Dubbo-style REST that is interoperable in a microservices system (Springcloud Alibaba).

**1. Annotation Parsing**

**2. Message Codec**

**3. RestClient**

**4. RestServer (netty)**

Support Levels:

content-type: text, json, xml, form (will be extended later)

Annotations:

param, header, body, pathvariable (spring mvc & resteasy)

## Http Protocol Message

    POST /test/path?  HTTP/1.1
    Host: localhost:8080
    Connection: keep-alive
    Content-type: application/json

    {"name":"dubbo","age":10,"address":"hangzhou"}

### Dubbo Http (header)

    // service key header
    path: com.demo.TestInterface
    group: demo
    port: 80
    version: 1.0.0

    // ensure keep-alive
    Keep-Alive,Connection: keep-alive
    Keep-alive: 60

    // RPCContext Attachment
    userId: 123456

## Support Granularity

|  Data Location  |  content-type  |  spring annotations  |  resteasy annotations  |
| --- | --- | --- | --- |
|  body  |  No requirements  |  RequestBody  |   No annotations means body  |
|  querystring(?test=demo)  |  No requirements  |  RequestParam  |  QueryParam  |
|  header  |  No requirements  |  RequestHeader  |  PathParam  |
|  form  |  application/x-www-form-urlencoded  |  RequestParam RequestBody  |  FormParam  |
|  path  |  No requirements  |  PathVariable  |  PathParam  |
|  method  |  No requirements  |  PostMapping GetMapping  |  GET POST  |
|  url  |   |  PostMapping GetMapping path attribute  |  Path  |
|  content-type  |   |  PostMapping GetMapping consumers attribute  |  Consumers  |
|  Accept  |   |  PostMapping GetMapping produces attribute  |  Produces  |

## Rest Annotation Parsing
ServiceRestMetadataResolver

    JAXRSServiceRestMetadataResolver

    SpringMvcServiceRestMetadataResolver

ServiceRestMetadata

    public class ServiceRestMetadata implements Serializable {

        private String serviceInterface; // com.demo.TestInterface

        private String version;// 1.0.0

        private String group;// demo

        private Set<RestMethodMetadata> meta;// method meta information

        private int port;// port for provider service key

        private boolean consumer;// consumer flag

        /**
         * make a distinction between mvc & resteasy
         */
        private Class codeStyle;//

         /**
         *  for provider
         */
        private Map<PathMatcher, RestMethodMetadata> pathToServiceMap;

        /**
        * for consumer
        */
        private Map<String, Map<ParameterTypesComparator, RestMethodMetadata>> methodToServiceMap;

RestMethodMetadata

    public class RestMethodMetadata implements Serializable {

        private MethodDefinition method; // method definition info (name, paramType, returnType)

        private RequestMetadata request;// request meta info

        private Integer urlIndex;

        private Integer bodyIndex;

        private Integer headerMapIndex;

        private String bodyType;

        private Map<Integer, Collection<String>> indexToName;

        private List<String> formParams;

        private Map<Integer, Boolean> indexToEncoded;

        private ServiceRestMetadata serviceRestMetadata;

        private List<ArgInfo> argInfos;

        private Method reflectMethod;

        /**
         *  make a distinction between mvc & resteasy
         */
        private Class codeStyle;


ArgInfo

    public class ArgInfo {
        /**
         * method arg index 0,1,2,3
         */
        private int index;
        /**
         * method annotation name or name
         */
        private String annotationNameAttribute;

        /**
         * param annotation type
         */
        private Class paramAnnotationType;

        /**
         * param Type
         */
        private Class paramType;

        /**
         * param name
         */
        private String paramName;

        /**
         * url split("/") String[n]  index
         */
        private int urlSplitIndex;

        private Object defaultValue;

        private boolean formContentType;

RequestMetadata

    public class RequestMetadata implements Serializable {

        private static final long serialVersionUID = -240099840085329958L;

        private String method;// request method

        private String path;// request url

        private Map<String, List<String>> params // param parameters? concatenated

        private Map<String, List<String>> headers// header;

        private Set<String> consumes // content-type;

        private Set<String> produces // Accept;

### Consumer Code

refer

     @Override
        protected <T> Invoker<T> protocolBindingRefer(final Class<T> type, final URL url) throws RpcException {

            // restClient spi creation
            ReferenceCountedClient<? extends RestClient> refClient =
                clients.computeIfAbsent(url.getAddress(), key -> createReferenceCountedClient(url, clients));

            refClient.retain();

            // resolve metadata
            Map<String, Map<ParameterTypesComparator, RestMethodMetadata>> metadataMap = MetadataResolver.resolveConsumerServiceMetadata(type, url);

            ReferenceCountedClient<? extends RestClient> finalRefClient = refClient;
            Invoker<T> invoker = new AbstractInvoker<T>(type, url, new String[]{INTERFACE_KEY, GROUP_KEY, TOKEN_KEY}) {
                @Override
                protected Result doInvoke(Invocation invocation) {
                    try {
                        // get method meta info
                        RestMethodMetadata restMethodMetadata = metadataMap.get(invocation.getMethodName()).get(ParameterTypesComparator.getInstance(invocation.getParameterTypes()));

                        RequestTemplate requestTemplate = new RequestTemplate(invocation, restMethodMetadata.getRequest().getMethod(), url.getAddress(), getContextPath(url));

                        HttpConnectionCreateContext httpConnectionCreateContext = new HttpConnectionCreateContext();
                        // TODO  dynamic load config
                        httpConnectionCreateContext.setConnectionConfig(new HttpConnectionConfig());
                        httpConnectionCreateContext.setRequestTemplate(requestTemplate);
                        httpConnectionCreateContext.setRestMethodMetadata(restMethodMetadata);
                        httpConnectionCreateContext.setInvocation(invocation);
                        httpConnectionCreateContext.setUrl(url);

    										// http info build interceptor
                        for (HttpConnectionPreBuildIntercept intercept : httpConnectionPreBuildIntercepts) {
                            intercept.intercept(httpConnectionCreateContext);
                        }


                        CompletableFuture<RestResult> future = finalRefClient.getClient().send(requestTemplate);
                        CompletableFuture<AppResponse> responseFuture = new CompletableFuture<>();
                        AsyncRpcResult asyncRpcResult = new AsyncRpcResult(responseFuture, invocation);
                        // response handling
                        future.whenComplete((r, t) -> {
                            if (t != null) {
                                responseFuture.completeExceptionally(t);
                            } else {
                                AppResponse appResponse = new AppResponse();
                                try {
                                    int responseCode = r.getResponseCode();
                                    MediaType mediaType = MediaType.TEXT_PLAIN;

                                    if (400 < responseCode && responseCode < 500) {
                                        throw new HttpClientException(r.getMessage());
                                    } else if (responseCode >= 500) {
                                        throw new RemoteServerInternalException(r.getMessage());
                                    } else if (responseCode < 400) {
                                        mediaType = MediaTypeUtil.convertMediaType(r.getContentType());
                                    }


                                    Object value = HttpMessageCodecManager.httpMessageDecode(r.getBody(),
                                        restMethodMetadata.getReflectMethod().getReturnType(), mediaType);
                                    appResponse.setValue(value);
                                    Map<String, String> headers = r.headers()
                                        .entrySet()
                                        .stream()
                                        .collect(Collectors.toMap(Map.Entry::getKey, e -> e.getValue().get(0)));
                                    appResponse.setAttachments(headers);
                                    responseFuture.complete(appResponse);
                                } catch (Exception e) {
                                    responseFuture.completeExceptionally(e);
                                }
                            }
                        });
                        return asyncRpcResult;
                    } catch (RpcException e) {
                        if (e.getCode() == RpcException.UNKNOWN_EXCEPTION) {
                            e.setCode(getErrorCode(e.getCause()));
                        }
                        throw e;
                    }
                }

                @Override
                public void destroy() {
                    super.destroy();
                    invokers.remove(this);
                    destroyInternal(url);
                }
            };
            invokers.add(invoker);
            return invoker;

### Provider Code

export

     public <T> Exporter<T> export(final Invoker<T> invoker) throws RpcException {
            URL url = invoker.getUrl();
            final String uri = serviceKey(url);
            Exporter<T> exporter = (Exporter<T>) exporterMap.get(uri);
            if (exporter != null) {
                // When modifying the configuration through override, you need to re-expose the newly modified service.
                if (Objects.equals(exporter.getInvoker().getUrl(), invoker.getUrl())) {
                    return exporter;
                }
            }

            // TODO  addAll metadataMap to RPCInvocationBuilder metadataMap
            Map<PathMatcher, RestMethodMetadata> metadataMap = MetadataResolver.resolveProviderServiceMetadata(url.getServiceModel().getProxyObject().getClass(),url);

            PathAndInvokerMapper.addPathAndInvoker(metadataMap, invoker);

            final Runnable runnable = doExport(proxyFactory.getProxy(invoker, true), invoker.getInterface(), invoker.getUrl());
            exporter = new AbstractExporter<T>(invoker) {
                @Override
                public void afterUnExport() {
                    exporterMap.remove(uri);
                    if (runnable != null) {
                        try {
                            runnable.run();
                        } catch (Throwable t) {
                            logger.warn(PROTOCOL_UNSUPPORTED, "", "", t.getMessage(), t);
                        }
                    }
                }
            };
            exporterMap.put(uri, exporter);
            return exporter;
        }

RestHandler

     private class RestHandler implements HttpHandler<HttpServletRequest, HttpServletResponse> {

            @Override
            public void handle(HttpServletRequest servletRequest, HttpServletResponse servletResponse) throws IOException, ServletException {
                 // has servlet request and nettyRequest
                RequestFacade request = RequestFacadeFactory.createRequestFacade(servletRequest);
                RpcContext.getServiceContext().setRemoteAddress(request.getRemoteAddr(), request.getRemotePort());
    //            dispatcher.service(request, servletResponse);

                Pair<RpcInvocation, Invoker> build = null;
                try {
                    // create RPCInvocation based on request info
                    build = RPCInvocationBuilder.build(request, servletRequest, servletResponse);
                } catch (PathNoFoundException e) {
                    servletResponse.setStatus(404);
                }

                Invoker invoker = build.getSecond();

                Result invoke = invoker.invoke(build.getFirst());

                // TODO handling exceptions
                if (invoke.hasException()) {
                    servletResponse.setStatus(500);
                } else {

                    try {
                        Object value = invoke.getValue();
                        String accept = request.getHeader(RestConstant.ACCEPT);
                        MediaType mediaType = MediaTypeUtil.convertMediaType(accept);
                        // TODO write response
                        HttpMessageCodecManager.httpMessageEncode(servletResponse.getOutputStream(), value, invoker.getUrl(), mediaType);
                        servletResponse.setStatus(200);
                    } catch (Exception e) {
                        servletResponse.setStatus(500);
                    }

                }

                // TODO add Attachment header

            }
        }

RPCInvocationBuilder

    {

        private static final ParamParserManager paramParser = new ParamParserManager();

        public static Pair<RpcInvocation, Invoker> build(RequestFacade request, Object servletRequest, Object servletResponse) {
            // get invoker
            Pair<Invoker, RestMethodMetadata> invokerRestMethodMetadataPair = getRestMethodMetadata(request);

            RpcInvocation rpcInvocation = createBaseRpcInvocation(request, invokerRestMethodMetadataPair.getSecond());

            ProviderParseContext parseContext = createParseContext(request, servletRequest, servletResponse, invokerRestMethodMetadataPair.getSecond());
            // parameter construction
            Object[] args = paramParser.providerParamParse(parseContext);

            rpcInvocation.setArguments(args);

            return Pair.make(rpcInvocation, invokerRestMethodMetadataPair.getFirst());
        }

        private static ProviderParseContext createParseContext(RequestFacade request, Object servletRequest, Object servletResponse, RestMethodMetadata restMethodMetadata) {
            ProviderParseContext parseContext = new ProviderParseContext(request);
            parseContext.setResponse(servletResponse);
            parseContext.setRequest(servletRequest);

            Object[] objects = new Object[restMethodMetadata.getArgInfos().size()];
            parseContext.setArgs(Arrays.asList(objects));
            parseContext.setArgInfos(restMethodMetadata.getArgInfos());

            return parseContext;
        }

        private static RpcInvocation createBaseRpcInvocation(RequestFacade request, RestMethodMetadata restMethodMetadata) {
            RpcInvocation rpcInvocation = new RpcInvocation();

            int localPort = request.getLocalPort();
            String localAddr = request.getLocalAddr();
            int remotePort = request.getRemotePort();
            String remoteAddr = request.getRemoteAddr();

            String HOST = request.getHeader(RestConstant.HOST);
            String GROUP = request.getHeader(RestConstant.GROUP);

            String PATH = request.getHeader(RestConstant.PATH);
            String VERSION = request.getHeader(RestConstant.VERSION);

            String METHOD = restMethodMetadata.getMethod().getName();
            String[] PARAMETER_TYPES_DESC = restMethodMetadata.getMethod().getParameterTypes();

            rpcInvocation.setParameterTypes(restMethodMetadata.getReflectMethod().getParameterTypes());

            rpcInvocation.setMethodName(METHOD);
            rpcInvocation.setAttachment(RestConstant.GROUP, GROUP);
            rpcInvocation.setAttachment(RestConstant.METHOD, METHOD);
            rpcInvocation.setAttachment(RestConstant.PARAMETER_TYPES_DESC, PARAMETER_TYPES_DESC);
            rpcInvocation.setAttachment(RestConstant.PATH, PATH);
            rpcInvocation.setAttachment(RestConstant.VERSION, VERSION);
            rpcInvocation.setAttachment(RestConstant.HOST, HOST);
            rpcInvocation.setAttachment(RestConstant.REMOTE_ADDR, remoteAddr);
            rpcInvocation.setAttachment(RestConstant.LOCAL_ADDR, localAddr);
            rpcInvocation.setAttachment(RestConstant.REMOTE_PORT, remotePort);
            rpcInvocation.setAttachment(RestConstant.LOCAL_PORT, localPort);

            Enumeration<String> attachments = request.getHeaders(RestConstant.DUBBO_ATTACHMENT_HEADER);

            while (attachments != null && attachments.hasMoreElements()) {
                String s =  attachments.nextElement();

                String[] split = s.split("=");

                rpcInvocation.setAttachment(split[0], split[1]);
            }

            // TODO set path,version,group and so on
            return rpcInvocation;
        }

        private static Pair<Invoker, RestMethodMetadata> getRestMethodMetadata(RequestFacade request) {
            String path = request.getRequestURI();
            String version = request.getHeader(RestConstant.VERSION);
            String group = request.getHeader(RestConstant.GROUP);
            int port = request.getIntHeader(RestConstant.REST_PORT);

            return PathAndInvokerMapper.getRestMethodMetadata(path, version, group, port);
        }
    }

## Coding Examples

**API**

mvc

    @RestController()
    @RequestMapping("/demoService")
    public interface DemoService {
        @RequestMapping(value = "/hello", method = RequestMethod.GET)
        Integer hello(@RequestParam Integer a, @RequestParam Integer b);

        @RequestMapping(value = "/error", method = RequestMethod.GET)
        String error();

        @RequestMapping(value = "/say", method = RequestMethod.POST, consumes = MediaType.TEXT_PLAIN_VALUE)
        String sayHello(@RequestBody String name);
    }

resteasy:

    @Path("/demoService")
    public interface RestDemoService {
        @GET
        @Path("/hello")
        Integer hello(@QueryParam("a")Integer a,@QueryParam("b") Integer b);

        @GET
        @Path("/error")
        String error();

        @POST
        @Path("/say")
        @Consumes({MediaType.TEXT_PLAIN})
        String sayHello(String name);

        boolean isCalled();
    }

impl(service)

    @DubboService()
    public class RestDemoServiceImpl implements RestDemoService {
        private static Map<String, Object> context;
        private boolean called;

        @Override
        public String sayHello(String name) {
            called = true;
            return "Hello, " + name;
        }

        public boolean isCalled() {
            return called;
        }

        @Override
        public Integer hello(Integer a, Integer b) {
            context = RpcContext.getServerAttachment().getObjectAttachments();
            return a + b;
        }

        @Override
        public String error() {
            throw new RuntimeException();
        }

        public static Map<String, Object> getAttachments() {
            return context;
        }
    }

## Flow Chart

**Consumer**  

![image](https://static.dingtalk.com/media/lQLPJxLOtqTxs9TNA5rNBQCwci8F2QYiGAYD5sSyd4BVAA_1280_922.png)

**Provider(RestServer)**

![image](https://static.dingtalk.com/media/lQLPJxZcNUm4M9TNA1_NBMuwZUu6IC3FeYAD5sSydYADAA_1227_863.png)

## Scenarios 

### 1. Interoperability of Systems

**Non-Dubbo System Interoperability (Springcloud Alibaba Interoperability)**

Interoperability Conditions:

|   |  Protocol  |  Dubbo  |  SpringCloud Alibaba  |  Interoperation  |
| --- | --- | --- | --- | --- |
|  Communication Protocol  |  rest  |  spring web/resteasy encoding style  |  integrates feignclient, ribbon (spring web encoding style)  |  Yes  |
|  |  triple  |   |   |   |
|  |  dubbo  |   |   |   |
|  |  grpc  |   |   |   |
|  |  hessian  |   |   |   |
|  Registration Center  |  zookeeper  |   |   |   |
|   |  nacos  |  supported  |  supported  |  application-level registration  |

### 2. Dubbo Dual Registration 

Complete application-level registration (from dubbo2 to dubbo3 migration), dubbo version upgrade

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/LvBPlNAjAmw3OdG8/img/0ceca951-f467-4ab3-9b71-8e7d52e5e7d1.png)

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/LvBPlNAjAmw3OdG8/img/6bcc7aed-1d22-470f-b185-efbab32df1e5.png)

### 3. Multi-Protocol Publishing

Configuration:

    <dubbo:service interface="org.apache.dubbo.samples.DemoService" protocol="dubbo, grpc, rest"/>

### 4. Cross-Language

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/LvBPlNAjAmw3OdG8/img/1bdf8f91-9666-4c20-9aea-8396c745f554.png)

### 5. Multi-Protocol Interaction

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/LvBPlNAjAmw3OdG8/img/af72e3df-05d5-42a2-a333-618be7ec6cb8.png)

### 6. Protocol Migration

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/LvBPlNAjAmw3OdG8/img/36d30183-8d5-494c-8ebb-b57403c88661.png)

Rest encoding style

HTTP protocol is more universally applicable for cross-language calls.

Dubbo Rest calls other HTTP services.

Other HttpClient calls Dubbo Rest.

Dubbo RestServer can directly interact with other web services, browsers, and clients via HTTP.

## Consumer TODO LIST
> Features have been initially implemented and can parse responses.

1. org/apache/dubbo/rpc/protocol/rest/RestProtocol.java:157  dynamic load config

2. org/apache/dubbo/remoting/http/factory/AbstractHttpClientFactory.java:50 load config HttpClientConfig

3. org/apache/dubbo/rpc/protocol/rest/annotation/metadata/MetadataResolver.java:52 support Dubbo style service

4. org/apache/dubbo/remoting/http/restclient/HttpClientRestClient.java:120 TODO config

5. org/apache/dubbo/remoting/http/restclient/HttpClientRestClient.java:140 TODO close judgment

6. org/apache/dubbo/rpc/protocol/rest/message/decode/MultiValueCodec.java:35 TODO java bean get set convert

## Provider TODO LIST
> To be implemented 

Netty implementation supporting HTTP protocol for NettyServer.

No annotation protocol definition.

Website scenario supplements.

## Rest User Documentation and Demo
