import { TreeNode } from 'lab2/src/utils/tree/buildTree';
import Processor from './processor';
import { Memory } from './memory';
import { GanttLog } from './types/GanttLog';
import { SystemConfig } from 'lab5/src/system/types/SystemConfig';
import { MemoryOperation } from 'lab5/src/system/types/MemoryOperation';
import { Instruction } from 'lab5/src/system/types/Instruction';

export class System {
  public config: SystemConfig;
  private processors: Processor[];
  private memory: Memory;
  private readonly executionLog: GanttLog[]; // For Gantt chart data
  private lastUsedProcessorIndex: number = 0;

  constructor() {
    this.config = { processors: 5, memorySlots: 100 };
    this.processors = [];
    this.memory = new Memory(this.config.memorySlots);
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
    this.memory = new Memory(this.config.memorySlots);
  }

  private async accessMemory({
    operation,
    value,
    address,
  }: MemoryOperation): Promise<number> {
    const start = Date.now();

    let result: number | undefined = NaN;
    if (operation === 'write' && value && address) {
      await this.memory.write(address, value);
    } else if (operation === 'read' && address) {
      result = await this.memory.read(address);
    } else if (operation === 'allocate' && value) {
      result = await this.memory.allocateMemory(value);
    } else {
      return result;
    }

    const end = Date.now();
    this.executionLog.push({
      start,
      end,
      operation: {
        executorId: 'Memory',
        description: `${operation} at address ${(address ? address : result) ?? 'N/A'}`,
      },
    });

    return result ?? NaN;
  }

  private async compileToInstructionWords(
    expressionTree: TreeNode,
  ): Promise<Instruction[]> {
    const instructions: Instruction[] = [];

    const traverse = async (node: TreeNode): Promise<number> => {
      if (!node.left && !node.right) {
        // Leaf node: return its position in memory
        return node.token.position;
      }

      const leftDest = await traverse(node.left!);
      const rightDest = await traverse(node.right!);

      const destination = await this.accessMemory({
        operation: 'allocate',
        value: instructions.length,
      });
      instructions.push({
        op: node.token.value,
        leftOperand: leftDest,
        rightOperand: rightDest,
        destination,
      });

      return destination;
    };

    await traverse(expressionTree);
    return instructions;
  }

  private scheduleInstructionWords(
    instructions: Instruction[],
  ): Instruction[][] {
    const instructionWords: Instruction[][] = [];
    const processorCount = this.config.processors;

    let currentWord: Instruction[] = [];
    instructions.forEach((instruction, index) => {
      if (currentWord.length < processorCount) {
        currentWord.push(instruction);
      }
      if (
        currentWord.length === processorCount ||
        index === instructions.length - 1
      ) {
        instructionWords.push(currentWord);
        currentWord = [];
      }
    });

    return instructionWords;
  }

  private async executeInstructionWords(instructionWords: Instruction[][]) {
    for (const word of instructionWords) {
      await Promise.all(
        word.map(async instruction => {
          const processor = this.getAvailableProcessor();
          const start = Date.now();
          const result = await processor.executeOperation(instruction);
          const end = Date.now();
          this.executionLog.push({
            start,
            end,
            operation: {
              executorId: processor.id,
              description:
                `${instruction.op}(${instruction.leftOperand}, ${instruction.rightOperand})` +
                ` -> ${result}`,
            },
          });
          await this.accessMemory({
            operation: 'write',
            value: result,
            address: instruction.destination,
          });
        }),
      );
    }
  }

  private getAvailableProcessor(): Processor {
    const sortedProcessors = this.processors.sort(
      (a, b) => a.processorLoad - b.processorLoad,
    );

    for (let i = 0; i < sortedProcessors.length; i++) {
      const processorIndex =
        (this.lastUsedProcessorIndex + i) % sortedProcessors.length;
      const processor = sortedProcessors[processorIndex];

      if (!processor.isBusy()) {
        this.lastUsedProcessorIndex = processorIndex; // Update last used
        return processor;
      }
    }

    return sortedProcessors[0];
  }

  async executeExpressionTree(expressionTree: TreeNode): Promise<number> {
    const instructions = await this.compileToInstructionWords(expressionTree);
    const instructionWords = this.scheduleInstructionWords(instructions);

    await this.executeInstructionWords(instructionWords);

    const finalInstruction = instructions[instructions.length - 1];
    return await this.accessMemory({
      operation: 'read',
      address: finalInstruction.destination,
    });
  }

  get log() {
    return this.executionLog;
  }
}
