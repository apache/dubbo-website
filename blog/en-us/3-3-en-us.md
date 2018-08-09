<h4>Mode of Deserialization</h4>
If what happens next after finishing the IO thread does not invoke a new IO thread, and can be excuted quickly, this event should be excuted in IO thread. This will release the pressure of thread pool scheduling, and accelerate in IO as well. Therefore, 2 modes of deserialzation are provided for either decoding in IO thread or decoding in job thread.

````xml
<ddubbo:protocol decode.in.io="false">
````

Decode in IO
+ true： indicates that decoding is excuted in IO thread, in which case thread pool scheduling will decrease, and some computing resources will be released.(Default)
+ fasle: indicates that decoding is not finished in IO thread, and should be excuted in job thread. If it takes long enough time to deserialize, block the IO thread could be risky, in which case decoding should be moved out of the IO thread.
