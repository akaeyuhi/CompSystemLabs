import { Instruction } from './types/Instruction';
import { randomUUID } from 'node:crypto';

export default class Processor {
  readonly id = randomUUID();
  private currentLoad: number;
  private busy: boolean;

  constructor() {
    this.currentLoad = 0;
    this.busy = false;
  }

  isBusy(): boolean {
    return this.busy;
  }

  async executeOperation(instruction: Instruction): Promise<number> {
    const { op, leftOperand, rightOperand } = instruction;
    const timeRequired = this.getOperationTime(op);

    this.busy = true;
    this.currentLoad += timeRequired;
    await this.delay(timeRequired); // Simulate execution time
    this.currentLoad -= timeRequired;
    this.busy = false;

    switch (op) {
      case '+':
        return leftOperand + rightOperand;
      case '-':
        return leftOperand - rightOperand;
      case '*':
        return leftOperand * rightOperand;
      case '/':
        return leftOperand / rightOperand;
      default:
        throw new Error(`Unsupported operation: ${op}`);
    }
  }

  getOperationTime(op: string): number {
    const timings = {
      '+': 5,
      '-': 5,
      '*': 10,
      '/': 10,
      '^': 15,
    };
    return timings[op as keyof typeof timings] || 1;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get processorLoad() {
    return this.currentLoad;
  }
}
