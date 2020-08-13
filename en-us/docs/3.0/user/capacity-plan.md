# Capacity plan

The following data for reference：

## Use member service project of Dubbo

* Receive 400,000,000 remote calls one day 
* Use 12 standard servers to provide services (CPU:8 core, memory: 8G)
* The average load is less than 1 (For 8 core CPU, the load is very low)
* The average response time is 2.3 to 2.5 ms，Network cost about 1.5 to 1.6 ms(Related to the size of the packet )

## Use product authorization service project of Dubbo

* Receive 300,000,000 remote calls one day 
* Use 8 standard servers to provide services (CPU:8 core, memory: 8G)
* The average load is less than 1 (For 8 core CPU, the load is very low)
* The average response time is  1.4 to 2.8 ms，Network cost about 1.0 to 1.1 ms(Related to the size of the packet )