import { Bench } from '@probe.gl/bench';
import { customLogger, runBenchmarks } from './ProbeGLHelper';
import React, { useEffect } from 'react';

async function sample_function_sleep_async() {
  const sleep = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );
  await sleep(100);
}

function sample_function_math_sqrt() {
  Math.sqrt(100);
}

async function sample_benchmark() {
  const benchOptions = {
    id: "Suite Name",
    log: customLogger,
    minIterations: 3
  };
  const bench = new Bench(benchOptions);

  // Benchmark Group 1
  bench.group("Group Name 1")
    .addAsync(null, 'sleep_async',
      async () => {
        await sample_function_sleep_async()
      },
      null);

  // Benchmark Group 2
  bench.group("Group Name 2")
    .add(null, 'math_sqrt',
      () => {
        sample_function_math_sqrt()
      },
      null);

  // Run our helper function runBenchmark(...)
  await runBenchmarks(bench);
}

function App() {
  useEffect(() => {
    sample_benchmark()
}, []);

  return <div>Look in the development console to see your benchmark results!</div>
}

export default App;