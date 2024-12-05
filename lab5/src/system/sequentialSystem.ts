import { TreeNode } from '../../../lab2/src/utils/tree/buildTree';
import { GanttLog } from './types/GanttLog';

export class SequentialExecutor {
  private readonly operationTimings: Record<string, number>;
  private readonly memoryDelays: Record<string, number>;
  private executionLog: GanttLog[];

  constructor() {
    this.operationTimings = {
      '+': 5,
      '-': 5,
      '*': 10,
      '/': 10,
      '^': 15,
    };

    this.memoryDelays = {
      write: 10,
      read: 3,
      allocate: 5,
    };

    this.executionLog = [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async logOperation(
    executorId: string,
    description: string,
    action: () => Promise<void>,
  ): Promise<void> {
    const start = Date.now();
    await action();
    const end = Date.now();
    this.executionLog.push({
      start,
      end,
      operation: { executorId, description },
    });
  }

  private async memoryOperation(
    action: keyof typeof this.memoryDelays,
    description: string,
  ): Promise<void> {
    const delayTime = this.memoryDelays[action];
    await this.logOperation('Memory', description, () => this.delay(delayTime));
  }

  private async computeOperation(
    op: string,
    description: string,
  ): Promise<void> {
    const delayTime = this.operationTimings[op] || 1;
    await this.logOperation('Processor', description, () =>
      this.delay(delayTime),
    );
  }

  private assignRandomValues(tree: TreeNode): void {
    const assignValue = (node: TreeNode): void => {
      if (!node.left && !node.right) {
        node.token.value = (Math.random() * 100).toFixed(2); // Random leaf values
      } else {
        if (node.left) assignValue(node.left);
        if (node.right) assignValue(node.right);
      }
    };
    assignValue(tree);
  }

  async executeExpressionTreeSequentially(
    expressionTree: TreeNode,
  ): Promise<number> {
    this.assignRandomValues(expressionTree);

    const evaluateNode = async (node: TreeNode): Promise<number> => {
      if (!node.left && !node.right) {
        const value = parseFloat(node.token.value);
        if (isNaN(value)) {
          throw new Error(`Invalid token value: ${node.token.value}`);
        }
        await this.memoryOperation('read', `Read value ${value} from memory`);
        return value;
      }

      const leftValue = await evaluateNode(node.left!);
      const rightValue = await evaluateNode(node.right!);

      const operationDescription = `${node.token.value}(${leftValue}, ${rightValue})`;
      await this.computeOperation(
        node.token.value,
        `Compute ${operationDescription}`,
      );

      let result: number;
      switch (node.token.value) {
        case '+':
          result = leftValue + rightValue;
          break;
        case '-':
          result = leftValue - rightValue;
          break;
        case '*':
          result = leftValue * rightValue;
          break;
        case '/':
          if (rightValue === 0) {
            throw new Error('Division by zero');
          }
          result = leftValue / rightValue;
          break;
        case '^':
          result = Math.pow(leftValue, rightValue);
          break;
        default:
          throw new Error(`Unsupported operation: ${node.token.value}`);
      }

      await this.memoryOperation('write', `Write result ${result} to memory`);
      return result;
    };

    await this.memoryOperation('allocate', 'Allocate memory for root node');
    return evaluateNode(expressionTree);
  }

  get log(): GanttLog[] {
    return this.executionLog;
  }

  clearExecutionLog(): void {
    this.executionLog = [];
  }
}
