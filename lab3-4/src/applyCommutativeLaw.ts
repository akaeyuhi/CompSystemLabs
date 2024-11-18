import { TreeNode } from '../../lab2/src/utils/tree/buildTree';
import { isCommutative } from './utils/isCommutative';
import { getNodeWeight } from './utils/getNodeWeight';
import { TokenType } from '../../lab2/src/utils/tokenization/getTokenType';

export async function applyCommutativeLaw(node: TreeNode): Promise<TreeNode> {
  if (!node.left || !node.right) return node; // Лист або односторонній вузол

  if (isCommutative(node.token.value)) {
    // Зібрати всі терми
    const terms: TreeNode[] = await collectTerms(node, node.token.value);

    // Сортувати терми за вагою
    terms.sort((a, b) => getNodeWeight(a) - getNodeWeight(b));

    // Побудувати збалансоване дерево
    return buildBalancedTree(terms, node.token.value);
  }

  // Рекурсивно обробити піддерева
  node.left = await applyCommutativeLaw(node.left);
  node.right = await applyCommutativeLaw(node.right);
  return node;
}

// Збирає всі терми з піддерева для комутативної операції
async function collectTerms(
  node: TreeNode,
  operation: string,
): Promise<TreeNode[]> {
  if (!node.left || !node.right || node.token.value !== operation)
    return [node];
  return [
    ...(await collectTerms(node.left, operation)),
    ...(await collectTerms(node.right, operation)),
  ];
}

// Побудова збалансованого дерева
async function buildBalancedTree(
  terms: TreeNode[],
  operation: string,
): Promise<TreeNode> {
  if (terms.length === 1) return terms[0];

  const mid = Math.floor(terms.length / 2);
  return {
    token: { value: operation, type: TokenType.OPERATOR, position: -1 },
    left: await buildBalancedTree(terms.slice(0, mid), operation),
    right: await buildBalancedTree(terms.slice(mid), operation),
  };
}
