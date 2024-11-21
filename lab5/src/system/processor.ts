import { randomUUID } from 'node:crypto';

export default class Processor {
  readonly id = randomUUID();
  private currentLoad: number;

  constructor() {
    this.currentLoad = 0; // Initialize load to 0
  }

  async executeOperation(
    op: string,
    left: number,
    right: number,
  ): Promise<number> {
    const timeRequired = this.getOperationTime(op);
    this.currentLoad += timeRequired;
    await this.delay(timeRequired);
    this.currentLoad -= timeRequired;

    switch (op) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return left / right;
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

  getCurrentLoad(): number {
    return this.currentLoad;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
