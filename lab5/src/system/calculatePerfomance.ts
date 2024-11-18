import { System } from './system';
import { TreeNode } from 'lab2/src/utils/tree/buildTree';

export class PerformanceCalculator {
  private system: System;

  constructor(system: System) {
    this.system = system;
  }

  // Calculate total execution time of all operations
  getTotalExecutionTime(): number {
    let totalTime = 0;
    for (const log of this.system.log) {
      totalTime += log.end - log.start;
    }
    return totalTime;
  }

  // Calculate processor utilization (average processing time per processor)
  getProcessorUtilization(): Map<string, number> {
    const utilizationMap = new Map<string, number>();
    for (const log of this.system.log) {
      // Assuming the log operation is related to processor execution
      const processorId = log.operation.executorId;
      if (
        processorId !== undefined &&
        processorId !== 'Memory' &&
        processorId !== 'System'
      ) {
        const currentTime = log.end - log.start;
        const currentUtilization = utilizationMap.get(processorId) || 0;
        utilizationMap.set(processorId, currentUtilization + currentTime);
      }
    }
    return utilizationMap;
  }

  // Calculate total memory usage (total memory read/write)
  getMemoryUsage(): { readCount: number; writeCount: number } {
    let readCount = 0;
    let writeCount = 0;
    for (const log of this.system.log) {
      if (log.operation.description.includes('Memory Read')) {
        readCount++;
      } else if (log.operation.description.includes('Memory Write')) {
        writeCount++;
      }
    }
    return { readCount, writeCount };
  }

  // Calculate Speedup (Acceleration Coefficient)
  async getSpeedup(executionTree: TreeNode): Promise<number> {
    // Simulate the execution time with only one processor
    const singleProcessorSystem = new System();
    singleProcessorSystem.createConfig({ processors: 1 });
    const sequentialTime =
      await singleProcessorSystem.executeExpressionTree(executionTree);

    const parallelTime = this.getTotalExecutionTime();

    return sequentialTime / parallelTime;
  }

  // Calculate System Efficiency
  async getEfficiency(executionTree: TreeNode): Promise<number> {
    const speedup = await this.getSpeedup(executionTree);
    const numProcessors = this.system.config.processors;
    return speedup / numProcessors;
  }
}
