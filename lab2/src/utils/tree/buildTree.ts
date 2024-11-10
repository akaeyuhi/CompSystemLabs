import { Token } from '../tokenization/tokenize';
import { TokenType } from '../tokenization/getTokenType';
import { optimizeExpressionTree } from './optimizeTree';

export type TreeNode = {
  token: Token;
  left?: TreeNode;
  right?: TreeNode;
};

export async function buildExpressionTree(
  tokens: Token[],
): Promise<TreeNode | null> {
  const stack: TreeNode[] = [];

  for (const token of tokens) {
    if (token.type === TokenType.NUMBER || token.type === TokenType.VARIABLE) {
      stack.push({ token });
    } else if (token.type === TokenType.OPERATOR) {
      const rightNode = stack.pop();
      const leftNode = stack.pop();

      if (!rightNode || !leftNode) {
        throw new Error('Insufficient operands for operator');
      }

      // Create a new tree node and push to the stack
      const newNode: TreeNode = { token, left: leftNode, right: rightNode };

      if (Math.abs(getHeight(leftNode) - getHeight(rightNode)) > 1) {
        newNode.left = rebalanceTree(leftNode);
        newNode.right = rebalanceTree(rightNode);
      }

      stack.push(newNode);
    }
  }

  const result = stack.pop() || null;
  if (result) {
    return (await optimizeExpressionTree(result)) || null;
  }
  return result;
}

function getHeight(node: TreeNode | undefined): number {
  if (!node) return 0;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function getBalanceFactor(node: TreeNode | undefined): number {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
}

function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  return y;
}

function rebalanceTree(node: TreeNode): TreeNode {
  const balance = getBalanceFactor(node);

  if (balance > 1) {
    if (getBalanceFactor(node.left) < 0) {
      node.left = rotateLeft(node.left!);
    }
    return rotateRight(node);
  }

  if (balance < -1) {
    if (getBalanceFactor(node.right) > 0) {
      node.right = rotateRight(node.right!);
    }
    return rotateLeft(node);
  }

  return node;
}
