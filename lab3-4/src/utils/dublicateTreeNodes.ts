import { TreeNode } from '../../../lab2/src/utils/tree/buildTree';
import { serializeTreeNode } from './serializeTreeNode';

/**
 * Helper function to remove duplicate trees from an array of trees
 */
export function deduplicateTreeNodes(nodes: TreeNode[]): TreeNode[] {
  const seen = new Set<string>();
  return nodes.filter(node => {
    const key = serializeTreeNode(node);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
