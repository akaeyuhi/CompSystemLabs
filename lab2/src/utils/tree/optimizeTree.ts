import { TokenType } from '../tokenization/getTokenType';
import { TreeNode } from './buildTree';

export async function optimizeExpressionTree(
  node?: TreeNode,
): Promise<TreeNode | undefined> {
  if (!node) return undefined;

  if (node.token.type === TokenType.NUMBER) {
    return node;
  }

  node.left = await optimizeExpressionTree(node.left);
  node.right = await optimizeExpressionTree(node.right);

  if (
    node.left &&
    node.right &&
    node.left.token.type === TokenType.NUMBER &&
    node.right.token.type === TokenType.NUMBER
  ) {
    const leftValue = parseFloat(node.left.token.value);
    const rightValue = parseFloat(node.right.token.value);
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
        result = rightValue !== 0 ? leftValue / rightValue : NaN; // Перевірка на ділення на нуль
        break;
      case '^':
        result = Math.pow(leftValue, rightValue);
        break;
      default:
        throw new Error(`Unsupported operator: ${node.token.value}`);
    }

    if (!isNaN(result)) {
      return {
        token: {
          type: TokenType.NUMBER,
          value: result.toString(),
          position: node.token.position,
        },
      };
    }
  }

  return node;
}
