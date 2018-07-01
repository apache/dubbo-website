# 优化技巧：提前if判断帮助CPU分支预测
---

## 分支预测

在stackoverflow上有一个非常有名的问题：[为什么处理有序数组要比非有序数组快？](
https://stackoverflow.com/questions/11227809/why-is-it-faster-to-process-a-sorted-array-than-an-unsorted-array)，可见分支预测对代码运行效率有非常大的影响。

现代CPU都支持分支预测(branch prediction)和指令流水线(instruction pipeline)，这两个结合可以极大提高CPU效率。对于像简单的if跳转，CPU是可以比较好地做分支预测的。但是对于switch跳转，CPU则没有太多的办法。switch本质上是据索引，从地址数组里取地址再跳转。

要提高代码执行效率，一个重要的原则就是尽量避免CPU把流水线清空，那么提高分支预测的成功率就非常重要。

那么对于代码里，如果某个switch分支概率很高，是否可以考虑代码层面帮CPU把判断提前，来提高代码执行效率呢？

## Dubbo里ChannelEventRunnable的switch判断

在`ChannelEventRunnable`里有一个switch来判断channel state，然后做对应的逻辑：[查看](
https://github.com/hengyunabc/incubator-dubbo/blob/dubbo-2.6.1/dubbo-remoting/dubbo-remoting-api/src/main/java/com/alibaba/dubbo/remoting/transport/dispatcher/ChannelEventRunnable.java#L54)

一个channel建立起来之后，超过99.9%情况它的state都是`ChannelState.RECEIVED`，那么可以考虑把这个判断提前。

## benchmark验证

下面通过jmh来验证下：

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
* benchSiwtch里是纯switch判断
* benchIfAndSwitch 里用一个if提前判断state是否`ChannelState.RECEIVED`

benchmark结果是：

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

可以看到提前if判断的确提高了代码效率，这种技巧可以放在性能要求严格的地方。

Benchmark代码：https://github.com/hengyunabc/jmh-demo

## 总结

* switch对于CPU来说难以做分支预测
* 某些switch条件如果概率比较高，可以考虑单独提前if判断，充分利用CPU的分支预测机制
