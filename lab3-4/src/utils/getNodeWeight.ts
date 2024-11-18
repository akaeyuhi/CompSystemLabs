import { TreeNode } from '../../../lab2/src/utils/tree/buildTree';

export function getNodeWeight(node: TreeNode): number {
  // Пріоритет вузлів (можна додати інші критерії)
  if (!node.left && !node.right) return 1; // Лист
  return (
    1 + (getNodeWeight(node.left!) || 0) + (getNodeWeight(node.right!) || 0)
  );
}
