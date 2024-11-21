import { TreeNode } from 'lab2/src/utils/tree/buildTree';
import Processor from './processor';
import { Memory } from './memory';

type SystemConfig = {
  processors: number;
  memoryBanks: number;
};

export type LogItem = {
  start: number;
  end: number;
  operation: {
    executorId: string;
    description: string;
  };
};

type MemoryOperation = {
  operation: 'read' | 'write' | 'allocate';
  value?: number;
  address?: number;
};

export class System {
  public config: SystemConfig;
  private processors: Processor[];
  private memory: Memory;
  private readonly executionLog: LogItem[]; // For Gantt chart data

  constructor() {
    this.config = { processors: 5, memoryBanks: 1 };
    this.processors = [];
    this.memory = new Memory(this.config.memoryBanks);
    this.executionLog = [];
    this.initializeSystem();
  }

  createConfig(newConfig: Partial<SystemConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.initializeSystem();
  }

  private initializeSystem() {
    this.processors = Array.from(
      { length: this.config.processors },
      () => new Processor(),
    );
    this.memory = new Memory(this.config.memoryBanks);
  }

  // Access memory with an operation
  private async accessMemory({
    operation,
    value,
    address,
  }: MemoryOperation): Promise<number> {
    if (operation === 'write' && value && address) {
      await this.memory.write(address, value);
      this.executionLog.push({
        start: Date.now(),
        end: Date.now() + this.memory.delays.write,
        operation: {
          executorId: 'Memory',
          description: `Memory Write at address ${address} -> ${value}`,
        },
      });
      return value;
    } else if (operation === 'read' && address) {
      const result = await this.memory.read(address);
      this.executionLog.push({
        start: Date.now(),
        end: Date.now() + this.memory.delays.read,
        operation: {
          executorId: 'Memory',
          description: `Memory Read at address ${address} -> ${result ?? 'Not found'}`,
        },
      });
      return result ?? NaN;
    } else if (operation === 'allocate' && value) {
      const result = await this.memory.allocateMemory(value);
      this.executionLog.push({
        start: Date.now(),
        end: Date.now() + this.memory.delays.allocate,
        operation: {
          executorId: 'Memory',
          description: `Memory allocate at address ${result} -> ${value}`,
        },
      });
      return result;
    }
    return NaN;
  }

  async executeExpressionTree(expressionTree: TreeNode): Promise<number> {
    const startTime = Date.now();
    const result = await this.processExpression(expressionTree);
    const endTime = Date.now();

    this.executionLog.push({
      start: startTime,
      end: endTime,
      operation: {
        executorId: 'System',
        description: 'Expression tree execution',
      },
    });

    return result;
  }

  private getRandomVariable() {
    return Math.floor(Math.random() * (100 - -100 + 1) - 100);
  }

  private async processExpression(node: TreeNode): Promise<number> {
    if (!node.left && !node.right) {
      return (
        (await this.accessMemory({
          operation: 'read',
          address: 0x100 + node.token.position,
        })) ?? this.getRandomVariable()
      );
    }

    const leftPromise = this.processExpression(node.left!);
    const rightPromise = this.processExpression(node.right!);

    const [leftResult, rightResult] = await Promise.all([
      leftPromise,
      rightPromise,
    ]);

    const resultAddress = await this.accessMemory({
      operation: 'allocate',
      value: node.token.position,
    });

    return this.scheduleOperation(
      node.token.value,
      leftResult,
      rightResult,
      resultAddress,
    );
  }

  private generateRandomInputs() {
    return [
      Math.floor(Math.random() * (100 - -100 + 1) - 100),
      Math.floor(Math.random() * (100 - -100 + 1) - 100),
    ];
  }

  private validateInputs(left: number | undefined, right: number | undefined) {
    let leftResult, rightResult;
    if (left && right) {
      leftResult = left;
      rightResult = right;
    }
    if (!left && right) {
      [leftResult] = this.generateRandomInputs();
      rightResult = right;
    }
    if (!right && left) {
      [rightResult] = this.generateRandomInputs();
      leftResult = left;
    }
    if (!right && !left) {
      [leftResult, rightResult] = this.generateRandomInputs();
    }

    return [leftResult, rightResult];
  }

  // Scheduling and execution logic
  private async scheduleOperation(
    op: string,
    left: number | undefined,
    right: number | undefined,
    resultAddress: number,
  ): Promise<number> {
    const availableProcessor = this.getAvailableProcessor();
    const [leftResult, rightResult] = this.validateInputs(left, right);

    const result = await availableProcessor.executeOperation(
      op,
      leftResult!,
      rightResult!,
    );

    // Log the operation
    this.executionLog.push({
      start: Date.now(),
      end: Date.now() + availableProcessor.getOperationTime(op),
      operation: {
        executorId: availableProcessor.id,
        description: `${op}(${leftResult}, ${rightResult})`,
      },
    });

    // Store the result in memory
    await this.accessMemory({
      operation: 'write',
      value: result,
      address: resultAddress,
    });

    return result;
  }

  private lastUsedProcessorIndex: number = 0;

  private getAvailableProcessor(): Processor {
    const sortedProcessors = this.processors.sort(
      (a, b) => a.getCurrentLoad() - b.getCurrentLoad(),
    );

    for (let i = 0; i < sortedProcessors.length; i++) {
      const processorIndex =
        (this.lastUsedProcessorIndex + i) % sortedProcessors.length;
      const processor = sortedProcessors[processorIndex];

      if (processor.getCurrentLoad() < this.getLoadThreshold()) {
        this.lastUsedProcessorIndex = processorIndex; // Update last used
        return processor;
      }
    }

    return sortedProcessors[0];
  }

  private getLoadThreshold(): number {
    return 100;
  }

  get log() {
    return this.executionLog;
  }
}
