---
title: "Early if Judgment Helps CPU Branch Prediction"
linkTitle: "Early if Judgment Helps CPU Branch Prediction"
tags: ["Java"]
date: 2019-02-03
description: >
    This article introduces optimization techniques that help CPU branch prediction through early if judgments.
---

## Branch Prediction

There is a very famous question on Stack Overflow: [Why is it faster to process a sorted array than an unsorted array?](
https://stackoverflow.com/questions/11227809/why-is-it-faster-to-process-a-sorted-array-than-an-unsorted-array), which shows that branch prediction has a significant impact on code execution efficiency.

Modern CPUs support branch prediction and instruction pipelining, which together can greatly enhance CPU efficiency. For simple if statements, CPUs can do a good job of branch prediction. However, for switch statements, the CPU has limited options. Switch essentially uses indexing to fetch addresses from an array and then jumps.

To improve code execution efficiency, an important principle is to avoid clearing the CPU pipeline as much as possible, making it vital to enhance the success rate of branch prediction.

In cases where a certain switch branch has a high probability, could we consider helping the CPU with early judgment to improve code execution efficiency?

## Switch Judgment in ChannelEventRunnable of Dubbo

In `ChannelEventRunnable`, there is a switch that assesses the channel state and performs corresponding logic: [View](
https://github.com/hengyunabc/dubbo/blob/dubbo-2.6.1/dubbo-remoting/dubbo-remoting-api/src/main/java/com/alibaba/dubbo/remoting/transport/dispatcher/ChannelEventRunnable.java#L54)

Once a channel is established, in over 99.9% of instances, its state is `ChannelState.RECEIVED`, so it may be worth considering moving this judgment ahead.

## Benchmark Validation

Below we verify with jmh:

```java
public class TestBenchMarks {
	public enum ChannelState {
		CONNECTED, DISCONNECTED, SENT, RECEIVED, CAUGHT
	}

	@State(Scope.Benchmark)
	public static class ExecutionPlan {
		@Param({ "1000000" })
		public int size;
		public ChannelState[] states = null;

		@Setup
		public void setUp() {
			ChannelState[] values = ChannelState.values();
			states = new ChannelState[size];
			Random random = new Random(new Date().getTime());
			for (int i = 0; i < size; i++) {
				int nextInt = random.nextInt(1000000);
				if (nextInt > 100) {
					states[i] = ChannelState.RECEIVED;
				} else {
					states[i] = values[nextInt % values.length];
				}
			}
		}
	}

	@Fork(value = 5)
	@Benchmark
	@BenchmarkMode(Mode.Throughput)
	public void benchSiwtch(ExecutionPlan plan, Blackhole bh) {
		int result = 0;
		for (int i = 0; i < plan.size; ++i) {
			switch (plan.states[i]) {
			case CONNECTED:
				result += ChannelState.CONNECTED.ordinal();
				break;
			case DISCONNECTED:
				result += ChannelState.DISCONNECTED.ordinal();
				break;
			case SENT:
				result += ChannelState.SENT.ordinal();
				break;
			case RECEIVED:
				result += ChannelState.RECEIVED.ordinal();
				break;
			case CAUGHT:
				result += ChannelState.CAUGHT.ordinal();
				break;
			}
		}
		bh.consume(result);
	}

	@Fork(value = 5)
	@Benchmark
	@BenchmarkMode(Mode.Throughput)
	public void benchIfAndSwitch(ExecutionPlan plan, Blackhole bh) {
		int result = 0;
		for (int i = 0; i < plan.size; ++i) {
			ChannelState state = plan.states[i];
			if (state == ChannelState.RECEIVED) {
				result += ChannelState.RECEIVED.ordinal();
			} else {
				switch (state) {
				case CONNECTED:
					result += ChannelState.CONNECTED.ordinal();
					break;
				case SENT:
					result += ChannelState.SENT.ordinal();
					break;
				case DISCONNECTED:
					result += ChannelState.DISCONNECTED.ordinal();
					break;
				case CAUGHT:
					result += ChannelState.CAUGHT.ordinal();
					break;
				}
			}
		}
		bh.consume(result);
	}
}
```
* benchSiwtch involves pure switch judgment
* benchIfAndSwitch makes an early if judgment to check if state is `ChannelState.RECEIVED`

Benchmark results are:

```
Result "io.github.hengyunabc.jmh.TestBenchMarks.benchSiwtch":
  576.745 ±(99.9%) 6.806 ops/s [Average]
  (min, avg, max) = (490.348, 576.745, 618.360), stdev = 20.066
  CI (99.9%): [569.939, 583.550] (assumes normal distribution)


# Run complete. Total time: 00:06:48

Benchmark                         (size)   Mode  Cnt     Score    Error  Units
TestBenchMarks.benchIfAndSwitch  1000000  thrpt  100  1535.867 ± 61.212  ops/s
TestBenchMarks.benchSiwtch       1000000  thrpt  100   576.745 ±  6.806  ops/s
```

It can be seen that the early if judgment indeed improved code efficiency; this technique can be applied in performance-critical areas.

Benchmark code: https://github.com/hengyunabc/jmh-demo

## Conclusion

* Switch statements are difficult for CPUs to perform branch prediction.
* For certain switch conditions with high probabilities, consider early if judgments to fully leverage the CPU's branch prediction mechanism.

