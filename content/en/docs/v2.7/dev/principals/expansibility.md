---
type: docs
title: "Talk About Expansion Of Extension And Incremental Extension"
linkTitle: "Extensibility"
weight: 4
---

> http://javatar.iteye.com/blog/690845


There are more and more products in our platform, the function of the product also more and more.Platform products in order to meet the requirement of each BU and department as well as product line, will surely will be a lot of irrelevant function together, the customer can use selective.In order to compatible with more demand for each product, each framework, are constantly expanding, and we often choose some extension of the extension, namely to old and new function expanded into a general implementation.I want to discuss is, in some cases also can consider to the expansion of the incremental way, also is to retain the original function of simplicity, new feature implementation independence.I have been doing the development of distributed service framework, and then take such problem in our project. 

Such as: remote invocation framework, definitely not serialize function, function is very simple, is to transfer as object, the object into a stream.But because of some places may be using osgi, such serialization, IO in this may be isolated and the business side of this.Need to stream into byte [] array, and then passed on to the business side of this serialization.In order to adapt itself to the requirements of the osgi, expanded the original non osgi with osgi scenes, so, no matter whether the osgi environment, all will move into a byte [] array, first copy again.However, most of the scenes with osgi, paid the price, but for the osgi.And if adopts incremental extension method, the osgi code intact, plus an osgi implementation, when wanting to use osgi, rely on osgi implementation can directly. 

Such as: remote invocation framework, definitely not serialize function, function is very simple, is to transfer as object, the object into a stream.But because of some places may be using osgi, such serialization, IO in this may be isolated and the business side of this.Need to stream into byte [] array, and then passed on to the business side of this serialization.In order to adapt itself to the requirements of the osgi, expanded the original non osgi with osgi scenes, so, no matter whether the osgi environment, all will move into a byte [] array, first copy again.However, most of the scenes with osgi, paid the price, but for the osgi.And if adopts incremental extension method, the osgi code intact, plus an osgi implementation, when wanting to use osgi, rely on osgi implementation can directly. 

Such as: no status messages before, is very simple, just pass a serialized object.Later a synchronous message send demand, need a Request/Response matching, using extended extension, naturally thought, stateless news is actually a Request without Response, add a Boolean state so in the Request, said do you want to return the Response.If the message is sent to a Session needs again, then add a Session interaction, and then found that the original synchronous message sent is a special case of Session message, all scenarios Session, don't need the Session can be ignored.

![open-expand](/imgs/dev/open-expand.jpg)

If the incremental extension, stateless messages intact, synchronous message is sent, on the basis of stateless news add a Request/Response processing, message sending session, plus a SessionRequest/SessionResponse processing. 

![close-expand](/imgs/dev/close-expand.jpg)
