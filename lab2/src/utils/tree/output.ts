import { Graph } from 'graphlib';
import { TreeNode } from './buildTree';
import { randomUUID } from 'node:crypto';

function buildGraph(
  node: TreeNode | null,
  graph: Graph,
  parent?: string,
): void {
  if (!node) return;

  const nodeId = randomUUID();
  graph.setNode(nodeId, { label: node.token.value });

  if (parent) {
    graph.setEdge(parent, nodeId);
  }

  if (node.left) {
    buildGraph(node.left, graph, nodeId);
  }

  if (node.right) {
    buildGraph(node.right, graph, nodeId);
  }
}

export function outputTreeGraph(root: TreeNode | null): Graph | undefined {
  if (!root) return;
  const graph = new Graph({ directed: true });
  buildGraph(root, graph);
  return graph;
}
