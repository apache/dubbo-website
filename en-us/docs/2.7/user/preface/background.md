# Background

With the fast development of Internet, the scale of web applications expands unceasingly, and finally we find that the traditional vertical architecture(monolithic) can not handle this any more. Distributed service architecture and the flow computing architecture are imperative, and a governance system is urgently needed to ensure an orderly evolution of the architecture.

![image](../sources/images/dubbo-architecture-roadmap.jpg)  

#### Monolithic architecture

When the traffic is very low, there is only one application, all the features are deployed together to reduce the deployment node and cost. At this point, the data access framework (ORM) is the key to simplifying the workload of the CRUD.

#### Vertical architecture 

When the traffic gets heavier, add monolithic application instances can not accelerate the access very well, one way to improve efficiency is to split the monolithic into discrete applications. At this point, the Web framework (MVC) used to accelerate front-end page development is the key. 
    
#### Distributed service architecture

When there are more and more vertical applications, the interaction between applications is inevitable, some core businesses are extracted and served as independent services, which gradually forms a stable service center，this way the front-end application can respond to the changeable market demand more quickly. At this point, the distributed service framework (RPC) for business reuse and integration is the key.

#### Flow computing architecture

When there are more and more services, capacity evaluation becomes difficult, and also services with small scales often causes waste of resources. To solve these problems, a scheduling center should be added to manage the cluster capacity based on traffics and to improve the utilization of the cluster. At this time, the resource scheduling and governance centers (SOA), which are used to improve machine utilization, are the keys.
