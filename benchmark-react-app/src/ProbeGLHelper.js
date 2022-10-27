// Helper variables
const consoleTableClone = console.table;
const LOG_ENTRY = {
    GROUP: 'group',
    TEST: 'test',
    COMPLETE: 'complete'
};

// Helper function to customLogger(...)
function convertItrsPerSecondToDecimal(itersPerSecond) {
    const value = parseFloat(itersPerSecond);
    const prefix = itersPerSecond[itersPerSecond.length - 3];
    if (prefix === 'm') {
        return `${(value / 1000).toFixed(3)}/s`;
    } else {
        return itersPerSecond;
    }
}

// Helper function to customLogger(...)
function getIterationRuntime(itersPerSecond) {
    const value = parseFloat(itersPerSecond);
    const prefix = itersPerSecond[itersPerSecond.length - 3];
    let iterations = 0;
    switch (prefix) {
        case 'M':
            iterations = value * 1000000;
            break;
        case 'K':
            iterations = value * 1000;
            break;
        case 'm':
            iterations = value / 1000;
            break;
        default:
            iterations = value;
            break;
    }
    return ((1000 / iterations) / 1000).toFixed(8);
}


// Coefficient of variation
let cv = {};
let testIndex = 0; 
export const customLogger = (result) => {
    const { entry, id, message, itersPerSecond, table, tests, priority, minIterations, time, delay, unit, error } = result;
    
    switch (entry) {
        case LOG_ENTRY.GROUP:
            // Commented code left here for reference
            // console.log(`Group: ${message}`);
            // console.log({ result });
            break;
        case LOG_ENTRY.TEST:
            // Commented code left here for reference
            // console.log(`Test: `);
            // console.log({ result });
            cv[testIndex++] = { 'cv': `±${(error * 100).toFixed(2)}%` }
            break;
        case LOG_ENTRY.COMPLETE:
            // Commented code left here for reference
            // console.log({ result });
            console.log(`Total runtime for ${id}: ${time}.`);

            testIndex = 0;
            let benchmarkGroup;
            let customTable = {};

            // Create a custom results table
            Object.keys(tests).forEach(key => {
                if (table.hasOwnProperty(key)) {
                    customTable[testIndex] = {
                        'Benchmark Name': key,
                        'Execution Time': `${getIterationRuntime(table[key].iterations)}s`,
                        'Benchmark Group': benchmarkGroup,
                        'Benchmark Suite': result.id,
                        'Coefficient of Variation': cv[testIndex]["cv"],
                        'Iterations/s': convertItrsPerSecondToDecimal(table[key].iterations),
                        '# Test Iterations': minIterations
                    };
                    testIndex++;
                } else {
                    benchmarkGroup = key;
                }
            });

            // Print the custom results table
            consoleTableClone(customTable);
            break;
        default:
    }
}

export const runBenchmarks = async (benchSuite) => {
    // This makes sure that all async tests run once per iteration and not 10+ times by default
    let allTests = benchSuite.tests;
    Object.keys(allTests).forEach(key => {
        if (allTests[key].async) {
            allTests[key].opts._throughput = 1;
        }
    });

    // Disable table outputs from probe.gl
    console.table = () => { }
    
    // Run benchmarks
    await benchSuite.run();

    // Enable all table outputs after tests are complete
    console.table = consoleTableClone;
}