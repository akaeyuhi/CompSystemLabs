import { TreeNode } from '../../lab2/src/utils/tree/buildTree';
import { TokenType } from '../../lab2/src/utils/tokenization/getTokenType';
import { deduplicateTreeNodes } from './utils/dublicateTreeNodes';

export async function applyDistributiveLaw(
  node: TreeNode,
): Promise<TreeNode[]> {
  // Base case: if it's a leaf node, return it as a single equivalent form
  if (!node.left && !node.right) {
    return [node];
  }

  // Recursively apply the distributive law to subtrees
  const leftForms = node.left ? await applyDistributiveLaw(node.left) : [];
  const rightForms = node.right ? await applyDistributiveLaw(node.right) : [];

  const results: TreeNode[] = [];

  // Case 1: a * (b + c) -> (a * b) + (a * c)
  if (node.token.value === '*' && node.right?.token.value === '+') {
    for (const left of leftForms) {
      for (const rightLeft of await applyDistributiveLaw(node.right.left!)) {
        for (const rightRight of await applyDistributiveLaw(
          node.right.right!,
        )) {
          results.push({
            token: { type: TokenType.OPERATOR, value: '+', position: -1 },
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
          });
        }
      }
    }
  }

  // Case 2: (a + b) * c -> (a * c) + (b * c)
  if (node.token.value === '*' && node.left?.token.value === '+') {
    for (const right of rightForms) {
      for (const leftLeft of await applyDistributiveLaw(node.left.left!)) {
        for (const leftRight of await applyDistributiveLaw(node.left.right!)) {
          results.push({
            token: { type: TokenType.OPERATOR, value: '+', position: -1 },
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
          });
        }
      }
    }
  }

  // If no distributive transformation applied,
  // keep the original structure with transformed subtrees
  if (results.length === 0) {
    for (const left of leftForms) {
      for (const right of rightForms) {
        results.push({ ...node, left, right });
      }
    }
  }

  // Deduplicate and return the results
  return deduplicateTreeNodes(results);
}
