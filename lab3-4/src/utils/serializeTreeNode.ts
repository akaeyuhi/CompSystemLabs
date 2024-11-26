import { TreeNode } from '../../../lab2/src/utils/tree/buildTree';

/**
 * Serializes a tree node into a string for deduplication purposes
 */
export function serializeTreeNode(node: TreeNode | undefined): string {
  if (!node) {
    return '';
  }
  return `${node.token.value}(${serializeTreeNode(node.left)},${serializeTreeNode(node.right)})`;
}
