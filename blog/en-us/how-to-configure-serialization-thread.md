
## [Issue 2131](https://github.com/apache/incubator-dubbo/issues/2131)


### EN
 
- Dubbo has already supported switch deserializiation between IO and Dubbo Threads.
- Users can switch bettwen IO and Dubbo threads by adding one param `decode.in.io=true/false` in consumer's request URL.
- If user set `decode.in.io=true`, Dubbo will deserialize in IO thread, otherwise, Dubbo will deserialize in Dubbo Threads. By default, the value will be `true`.
