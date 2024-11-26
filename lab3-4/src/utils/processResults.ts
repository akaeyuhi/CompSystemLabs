//import { outputTreeGraph } from '../../../lab2/src/utils/tree/output';
//import { convertDotToPng } from '../../../lab2/src/utils/tree/dotToPng';
import { TreeNode } from '../../../lab2/src/utils/tree/buildTree';
import { treeToInfix, verifyTransformation } from './verifyTransformation';

export const processResults = async (
  conversion: 'Commutative' | 'Distributive',
  expressionTree: TreeNode,
  commutativeTrees: TreeNode[],
  expression: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expressionIndex: number,
) => {
  console.log(`${conversion} trees of ${expression}:`);
  const tests = [];
  for (const tree of commutativeTrees) {
    //const commutativeGraph = outputTreeGraph(tree);
    // await convertDotToPng(
    //   commutativeGraph!,
    //   `${conversion}Graph${expressionIndex}-${commutativeTrees.indexOf(tree)}`,
    // );
    tests.push(verifyTransformation(expressionTree!, tree, expression));
    console.log(treeToInfix(tree));
  }
  if (tests.every(result => result)) {
    console.log(
      `${conversion} conversion of ${expression} is correct for all test cases`,
    );
  }
};
