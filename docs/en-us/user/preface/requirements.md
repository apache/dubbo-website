# Requirements

![image](../sources/images/dubbo-service-governance.jpg)

Before the advent of large-scare services, an application might just exposes or references remote service by using RMI or Hessian, the call is done by configuring serive URL, and load balance is done through hardwares, like F5.

**When there are more and more services, it becomes very difficult to configure the service URL, the single point pressure of F5 hardware load balancer is also increasing.** At this point, a service registry is needed to dynamically register and discover services to make the service's location transparent. By obtaining the list of service provider addresses in the consumer side, the soft load balancing and Failover can be realized, this reduces the dependence on the F5 hardware load balacer and some of the costs.

**When things go further, the service dependencies become so complex that it can't even tell which applications to start before, even the architect can't fully describe the application architecture relationships**. At this time, automatically draw the dependency diagram of the applications is needed to help the architect to be clear of the relationship.

**Then, the traffic becomes even heavier, the capacity problem of the service is exposed, how many machines are needed to support this service? When should the machine be added?** To solve these problems, first, the daily service calls and the amount of response time should be counted as a reference for capacity planning. Second, dynamically adjust the weight, increase the weight of an online machine, and recorded the response time changes until it reaches the threshold, record the visits times at this time, then multiply this number of visits by the total number of machines to calculate the capacity in turn.

Above are the most basic requirements of Dubbo.
