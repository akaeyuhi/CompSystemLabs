import { TreeNode } from '../../lab2/src/utils/tree/buildTree';
import { TokenType } from '../../lab2/src/utils/tokenization/getTokenType';
import { deduplicateTreeNodes } from './utils/dublicateTreeNodes';

export async function applyDistributiveLaw(
  node: TreeNode,
): Promise<TreeNode[]> {
  if (!node.left && !node.right) {
    return [node]; // Base case: single leaf node
  }

  const leftForms = node.left ? await applyDistributiveLaw(node.left) : [];
  const rightForms = node.right ? await applyDistributiveLaw(node.right) : [];

  const results: TreeNode[] = [];

  // Original node with transformed children (unchanged structure)
  for (const left of leftForms) {
    for (const right of rightForms) {
      results.push({ ...node, left, right });
    }
  }

  // Full Distributive Transformations
  if (
    node.token.value === '*' &&
    (node.right?.token.value === '+' || node.right?.token.value === '-')
  ) {
    for (const left of leftForms) {
      for (const rightLeft of await applyDistributiveLaw(node.right.left!)) {
        for (const rightRight of await applyDistributiveLaw(
          node.right.right!,
        )) {
          const transformedNode: TreeNode = {
            token: {
              type: TokenType.OPERATOR,
              value: node.right?.token.value,
              position: -1,
            },
            left: {
              token: { type: TokenType.OPERATOR, value: '*', position: -1 },
              left,
              right: rightLeft,
            },
            right: {
              token: { type: TokenType.OPERATOR, value: '*', position: -1 },
              left,
              right: rightRight,
            },
          };

          results.push(...(await applyDistributiveLaw(transformedNode)));
        }
      }
    }
  }

  if (
    node.token.value === '*' &&
    (node.left?.token.value === '+' || node.left?.token.value === '-')
  ) {
    for (const right of rightForms) {
      for (const leftLeft of await applyDistributiveLaw(node.left.left!)) {
        for (const leftRight of await applyDistributiveLaw(node.left.right!)) {
          const transformedNode: TreeNode = {
            token: {
              type: TokenType.OPERATOR,
              value: node.left?.token.value,
              position: -1,
            },
            left: {
              token: { type: TokenType.OPERATOR, value: '*', position: -1 },
              left: leftLeft,
              right,
            },
            right: {
              token: { type: TokenType.OPERATOR, value: '*', position: -1 },
              left: leftRight,
              right,
            },
          };

          results.push(...(await applyDistributiveLaw(transformedNode)));
        }
      }
    }
  }

  return deduplicateTreeNodes(results);
}
