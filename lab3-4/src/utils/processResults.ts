import { outputTreeGraph } from '../../../lab2/src/utils/tree/output';
import { convertDotToPng } from '../../../lab2/src/utils/tree/dotToPng';
import { TreeNode } from '../../../lab2/src/utils/tree/buildTree';
import { treeToInfix, verifyTransformation } from './verifyTransformation';

export const processResults = async (
  conversion: 'Commutative' | 'Distributive',
  expressionTree: TreeNode,
  trees: TreeNode[] | TreeNode,
  expression: string,
  expressionIndex: number,
) => {
  console.log(`${conversion} trees of ${expression}:`);
  const tests = [];
  if (!(trees instanceof Array)) {
    const graph = outputTreeGraph(trees);
    await convertDotToPng(graph!, `${conversion}Graph${expressionIndex}`);
    tests.push(verifyTransformation(expressionTree!, trees, expression));
    console.log(treeToInfix(trees));
  } else {
    for (const tree of trees) {
      const graph = outputTreeGraph(tree);
      await convertDotToPng(
        graph!,
        `${conversion}Graph${expressionIndex}-${trees.indexOf(tree)}`,
      );
      tests.push(verifyTransformation(expressionTree!, tree, expression));
      console.log(treeToInfix(tree));
    }
  }

  if (tests.every(result => result)) {
    console.log(
      `${conversion} conversion of ${expression} is correct for all test cases`,
    );
  }
};
