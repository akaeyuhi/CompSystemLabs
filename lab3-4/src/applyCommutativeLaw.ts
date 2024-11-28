import { TreeNode } from '../../lab2/src/utils/tree/buildTree';
import { TokenType } from '../../lab2/src/utils/tokenization/getTokenType';

export async function applyCommutativeLaw(
  root: TreeNode | null,
): Promise<TreeNode | null> {
  if (!root) return null;

  // Apply commutative law and rebuild the tree with minimum height
  return reorderCommutative(root);
}

async function reorderCommutative(node: TreeNode): Promise<TreeNode> {
  if (!node) return node;

  // Recursively process child nodes
  const left = node.left ? await reorderCommutative(node.left) : undefined;
  const right = node.right ? await reorderCommutative(node.right) : undefined;

  if (node.token.type === TokenType.OPERATOR) {
    if (isCommutative(node.token.value)) {
      const operands = collectOperands(node, node.token.value);
      operands.sort(compareOperands);

      return buildBalancedTree(operands, node.token.value);
    }
  }

  return { ...node, left, right };
}

function isCommutative(operator: string): boolean {
  return operator === '+' || operator === '*';
}

function collectOperands(node: TreeNode, operator: string): TreeNode[] {
  if (!node) return [];
  if (node.token.value !== operator) return [node];

  return [
    ...(node.left ? collectOperands(node.left, operator) : []),
    ...(node.right ? collectOperands(node.right, operator) : []),
  ];
}

function compareOperands(a: TreeNode, b: TreeNode): number {
  if (a.token.type === TokenType.NUMBER && b.token.type === TokenType.NUMBER) {
    return parseFloat(a.token.value) - parseFloat(b.token.value);
  }
  return a.token.value.localeCompare(b.token.value);
}

function buildBalancedTree(operands: TreeNode[], operator: string): TreeNode {
  if (operands.length === 1) return operands[0];

  const mid = Math.floor(operands.length / 2);
  const left = buildBalancedTree(operands.slice(0, mid), operator);
  const right = buildBalancedTree(operands.slice(mid), operator);

  return {
    token: { type: TokenType.OPERATOR, value: operator, position: -1 },
    left,
    right,
  };
}
