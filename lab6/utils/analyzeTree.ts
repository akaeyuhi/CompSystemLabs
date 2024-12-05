import { System } from 'lab5/src/system/system';
import { PerformanceCalculator } from 'lab5/src/system/calculatePerfomance';

export interface AnalysisResult {
  type: string;
  executionTime: number;
  speedup: number;
  efficiency: number;
}

export async function analyzeTree(
  system: System,
  analyzer: PerformanceCalculator,
  tree: any,
  type: string,
): Promise<AnalysisResult> {
  system.clearLog();
  system.clearMemory();
  await system.executeExpressionTree(tree);
  const executionTime = analyzer.getTotalExecutionTime();
  const speedup = await analyzer.getSpeedup(tree);
  const efficiency = await analyzer.getEfficiency(tree);

  return {
    type,
    executionTime,
    speedup,
    efficiency,
  };
}
