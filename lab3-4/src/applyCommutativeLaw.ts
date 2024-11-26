import { TreeNode } from '../../lab2/src/utils/tree/buildTree';
import { TokenType } from '../../lab2/src/utils/tokenization/getTokenType';
import { deduplicateTreeNodes } from './utils/dublicateTreeNodes';

export async function applyCommutativeLaw(node: TreeNode): Promise<TreeNode[]> {
  if (!node || node.token.type !== TokenType.OPERATOR) {
    return [node]; // Base case: return the node unchanged as a single equivalent form
  }

  const operator = node.token.value;
  const isCommutative = operator === '+' || operator === '*';

  // Recursively apply the commutative law to subtrees
  const leftForms = node.left ? await applyCommutativeLaw(node.left) : [];
  const rightForms = node.right ? await applyCommutativeLaw(node.right) : [];

  const results: TreeNode[] = [];

  if (isCommutative) {
    // Generate all permutations of the commutative operation
    for (const left of leftForms) {
      for (const right of rightForms) {
        // Original order
        results.push({
          token: { ...node.token },
          left,
          right,
        });

        // Swapped order
        results.push({
          token: { ...node.token },
          left: right,
          right: left,
        });
      }
    }
  } else {
    // Non-commutative: preserve the original order
    for (const left of leftForms) {
      for (const right of rightForms) {
        results.push({
          token: { ...node.token },
          left,
          right,
        });
      }
    }
  }

  // Deduplicate the results (avoiding identical subtrees in the output)
  return deduplicateTreeNodes(results);
}
