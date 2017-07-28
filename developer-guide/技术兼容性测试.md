Dubbo的协议，通讯，序列化，注册中心，负载均策等扩展点，都有多种可选策略，以应对不同应用场景，而我们的测试用例很分散，当用户自己需要加一种新的实现时，总是不确定能否满足扩展点的完整契约。

所以，我们需要对核心扩展点写 [TCK](http://en.wikipedia.org/wiki/Technology_Compatibility_Kit) (Technology Compatibility Kit)，用户增加一种扩展实现，只需通过TCK，即可确保与框架的其它部分兼容运行，可以有效提高整体健状性，也方便第三方扩展者接入，加速开源社区的成熟。

开源社区的行知同学已着手研究这一块，他的初步想法是借鉴JBoss的CDI-TCK，做一个Dubbo的TCK基础框架，在此之上实现Dubbo的扩展点TCK用例。

参见：http://docs.jboss.org/cdi/tck/reference/1.0.1-Final/html/introduction.html

如果大家有兴趣，也可以一起研究，和行知一块讨论。

#### Protocol TCK

> TODO

#### Registry TCK

> TODO