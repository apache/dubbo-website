# Compatibility test

Dubbo's protocol, communication, serialization, registry, load balancing and other SPI all offer alternative strategies for different application scenarios while our test cases are very scattered. Ours is always uncertain whether it can satisfy the complete contract of the extension point when users need to add a new implementation.     

Thus we need to use TCK (Technology Compatibility Kit) for the core extension points.  When users add a new implementaion, compatibility with the rest of the framework can be ensured with TCK. This can effectively improve the overall health and also facilitate the access of the third party extenders, which accelerates the maturity of the open source community.

Xingzhi from the open source community is already working on this part. His preliminary idea is to build a TCK framework for Dubbo drawing on the CDI-TCK of JBoss first, then realize the TCK implementing case of Dubbo. 

Reference：http://docs.jboss.org/cdi/tck/reference/1.0.1-Final/html/introduction.html

Anyone interested  is welcomed to work on this together. 

#### Protocol TCK

> TODO

#### Registry TCK

> TODO