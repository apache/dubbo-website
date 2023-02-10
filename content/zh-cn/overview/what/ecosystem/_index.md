---
type: docs
title: "生态"
linkTitle: "生态"
weight: 40
description: ""
no_list: true
---

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./protocol/" >}}'>协议</a>
                </h4>
                    <p>Dubbo 提供以下协议类型的支持：</p>
                    <p><a href='{{< relref "./protocol/dubbo" >}}'>Dubbo 协议</a></p>
                    <p><a href='{{< relref "./protocol/gRPC" >}}'>gRPC 协议</a></p>
                    <p><a href='{{< relref "./protocol/http" >}}'>HTTP / Rest 协议</a></p>
                    <p><a href='{{< relref "./protocol/thrift" >}}'>Thrift 协议</a></p>
                    <p><a href='{{< relref "./protocol/rmi" >}}'>RMI 协议</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./serialization/" >}}'>序列化</a>
                </h4>
                    <p>Dubbo 提供以下序列化类型的支持：</p>
                    <p><a href='{{< relref "./serialization/hessian" >}}'>Hessian 2</a></p>
                    <p><a href='{{< relref "./serialization/fastjson2" >}}'>Fastjson 2</a></p>
                    <p><a href='{{< relref "./serialization/protobuf" >}}'>Protobuf</a></p>
                    <p><a href='{{< relref "./serialization/fastjson" >}}'>Fastjson</a></p>
                    <p><a href='{{< relref "./serialization/gson" >}}'>Gson</a></p>
                    <p><a href='{{< relref "./serialization/msgpack" >}}'>MessagePack</a></p>
                    <p><a href='{{< relref "./serialization/avro" >}}'>Avro</a></p>
                    <p><a href='{{< relref "./serialization/fst" >}}'>FST</a></p>
                    <p><a href='{{< relref "./serialization/kryo" >}}'>Kryo</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./registry/" >}}'>注册中心</a>
                </h4>
                    <p>Dubbo 提供以下注册中心的支持：</p>
                    <p><a href='{{< relref "./registry/zookeeper" >}}'>Zookeeper</a></p>
                    <p><a href='{{< relref "./registry/nacos" >}}'>Nacos</a></p>
                    <p><a href='{{< relref "./registry/consul" >}}'>Consul</a></p>
                    <p><a href='{{< relref "./registry/sofa" >}}'>Sofa</a></p>
                    <p><a href='{{< relref "./registry/polaris" >}}'>Polaris</a></p>
                    <p><a href='{{< relref "./registry/eureka" >}}'>Eureka</a></p>
                    <p><a href='{{< relref "./registry/etcd" >}}'>Etcd</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./config-center/" >}}'>配置中心</a>
                </h4>
                    <p>Dubbo 提供以下配置中心的支持：</p>
                    <p><a href='{{< relref "./config-center/zookeeper" >}}'>Zookeeper</a></p>
                    <p><a href='{{< relref "./config-center/nacos" >}}'>Nacos</a></p>
                    <p><a href='{{< relref "./config-center/apollo" >}}'>Apollo</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./metadata-center/" >}}'>元数据中心</a>
                </h4>
                    <p>Dubbo 提供以下元数据中心的支持：</p>
                    <p><a href='{{< relref "./metadata-center/zookeeper" >}}'>Zookeeper</a></p>
                    <p><a href='{{< relref "./metadata-center/nacos" >}}'>Nacos</a></p>
                    <p><a href='{{< relref "./metadata-center/Redis" >}}'>Redis</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./gateway/" >}}'>网关</a>
                </h4>
                    <p>Dubbo 提供以下网关的支持：</p>
                    <p><a href='{{< relref "./gateway/apisix" >}}'>APISIX</a></p>
                    <p><a href='{{< relref "./gateway/shenyu" >}}'>Shenyu</a></p>
                    <p><a href='{{< relref "./gateway/higress" >}}'>Higress</a></p>
                    <p><a href='{{< relref "./gateway/kong" >}}'>Kong</a></p>
                    <p><a href='{{< relref "./gateway/pixiu" >}}'>Pixiu</a></p>
                    <p><a href='{{< relref "./gateway/tengine" >}}'>Tengine</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./service-mesh/" >}}'>Service Mesh</a>
                </h4>
                    <p>Dubbo 提供以下 Service Mesh 控制平面的支持：</p>
                    <p><a href='{{< relref "./service-mesh/istio" >}}'>istio</a></p>
                    <p><a href='{{< relref "./service-mesh/aeraki" >}}'>Aeraki</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./rate-limit/" >}}'>限流降级</a>
                </h4>
                    <p>Dubbo 提供以下限流降级的支持：</p>
                    <p><a href='{{< relref "./rate-limit/sentinel" >}}'>Sentinel</a></p>
                    <p><a href='{{< relref "./rate-limit/polaris" >}}'>Polaris</a></p>
                    <p><a href='{{< relref "./rate-limit/hystrix" >}}'>Hystrix</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./transaction/" >}}'>全局事务</a>
                </h4>
                    <p>Dubbo 提供以下全局事务的支持：</p>
                    <p><a href='{{< relref "./transaction/seata" >}}'>Seata</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./tracing/" >}}'>链路追踪</a>
                </h4>
                    <p>Dubbo 提供以下链路追踪的支持：</p>
                    <p><a href='{{< relref "./tracing/skywalking" >}}'>Skywalking</a></p>
                    <p><a href='{{< relref "./tracing/zipkin" >}}'>Zipkin</a></p>
                    <p><a href='{{< relref "./tracing/micrometer" >}}'>MicroMeter</a></p>
                    <p><a href='{{< relref "./tracing/opentelemetry" >}}'>OpenTelemetry</a></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./monitoring/" >}}'>监控</a>
                </h4>
                    <p>Dubbo 提供以下监控平台的支持：</p>
                    <p><a href='{{< relref "./monitoring/prometheus" >}}'>Prometheus</a></p>
                    <p><a href='{{< relref "./monitoring/grafana" >}}'>Grafana</a></p>
                    <p><a href='{{< relref "./monitoring/micrometer" >}}'>MicroMeter</a></p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}