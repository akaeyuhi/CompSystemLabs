import { System } from './system';
import { TreeNode } from '../../../lab2/src/utils/tree/buildTree';
import { GanttLog } from './types/GanttLog';
import { SequentialExecutor } from './sequentialSystem';

export class PerformanceCalculator {
  private system: System;
  private sequentialSystem: SequentialExecutor;

  constructor(system: System) {
    this.system = system;
    this.sequentialSystem = new SequentialExecutor();
  }

  // Calculate total execution time of all operations
  getTotalExecutionTime(ganttLog: GanttLog[] = this.system.log): number {
    let totalTime = 0;
    for (const log of ganttLog) {
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
  getMemoryUsage() {
    let readCount = 0;
    let writeCount = 0;
    let allocateCount = 0;
    for (const log of this.system.log) {
      if (log.operation.description.includes('read')) {
        readCount++;
      } else if (log.operation.description.includes('write')) {
        writeCount++;
      } else if (log.operation.description.includes('allocate')) {
        allocateCount++;
      }
    }
    return { readCount, writeCount, allocateCount };
  }

  // Calculate Speedup (Acceleration Coefficient)
  async getSpeedup(executionTree: TreeNode): Promise<number> {
    this.sequentialSystem.clearExecutionLog();
    // Simulate the execution time with only one processor
    await this.sequentialSystem.executeExpressionTreeSequentially(
      executionTree,
    );

    const sequentialTime = this.getTotalExecutionTime(
      this.sequentialSystem.log,
    );
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
