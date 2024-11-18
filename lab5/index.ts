import { tokenize } from '../lab2/src/utils/tokenization/tokenize';
import { parse } from '../lab2/src/utils/parser';
import { buildExpressionTree } from '../lab2/src/utils/tree/buildTree';
import { System } from './src/system/system';
import { PerformanceCalculator } from './src/system/calculatePerfomance';
import { generateGanttChart } from './src/gantt/chartGenerator';

async function main() {
  const expression = '2.5*(3+4.81/k-q+1*t)/(t+a*y/f+(5.616*x-t)+c*(t-a*y))';
  const system = new System();
  const analyzer = new PerformanceCalculator(system);
  const tokens = await tokenize(expression); // tokenization
  const { results, postfixTokens } = await parse(tokens);
  if (results.validness) {
    const expressionTree = (await buildExpressionTree(postfixTokens))!;
    await system.executeExpressionTree(expressionTree);
    const speedUp = await analyzer.getSpeedup(expressionTree);
    const efficiency = await analyzer.getEfficiency(expressionTree);
    console.log(`System analysis result: 
    Total execution time: ${analyzer.getTotalExecutionTime()} ms
    System speedUp: ${speedUp}
    System efficiency: ${efficiency}`);
    console.log('Processor utilization:', analyzer.getProcessorUtilization());
    console.log('Memory usage:', analyzer.getMemoryUsage());
    generateGanttChart(system.log);
  }
}

(async () => await main())();
