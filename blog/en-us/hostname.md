## Background

In the docker bridge network mode, you need to specify the registration host IP to implement external network communication. Dubbo which are used to set the ip and port addresses for external communication provides two pairs of system attributes for the startup phase.

- DUBBO_IP_TO_REGISTRY --- IP address registered to the registry 
- DUBBO_PORT_TO_REGISTRY --- Port port registered to the registry
- DUBBO_IP_TO_BIND --- Monitor ip address  
- DUBBO_PORT_TO_BIND --- Monitor Port port

## Default Value

1. The four configuration items above are optional. If you do not configure dubbo, you will get IP and port automatically. Please choose the configuration flexibly according to the specific deployment scenario.
2. Dubbo supports multiple protocols. If an application exposes multiple different protocol services at the same time and needs to specify ip or port separately for each service, add the protocol prefix before the above attributes. Such as:
	- HESSIAN_DUBBO_PORT_TO_BIND  Port bound by hessian protocol
    - DUBBO_DUBBO_PORT_TO_BIND   Port bound by dubbo protocol
	- HESSIAN_DUBBO_IP_TO_REGISTRY  IP registered in hessian protocol
	- DUBBO_DUBBO_PORT_TO_BIND    IP registered in dubbo protocol
3.  PORT_TO_REGISTRY or IP_TO_REGISTRY will not be used as the default value of PORT_TO_BIND or IP_TO_BIND， but the reverse is true
	-  If we set PORT_TO_REGISTRY=20881, IP_TO_REGISTRY=30.5.97.6, PORT_TO_BIND IP_TO_BIND will not be affected
	-  If we set PORT_TO_BIND=20881 IP_TO_BIND=30.5.97.6, default PORT_TO_REGISTRY=20881 IP_TO_REGISTRY=30.5.97.6

## Conclusion

We can use `host` property to set the host value. It support **IP and domain name**.