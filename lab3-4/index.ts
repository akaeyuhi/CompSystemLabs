import { tokenize } from '../lab2/src/utils/tokenization/tokenize';
import { parse } from '../lab2/src/utils/parser';
import { buildExpressionTree } from '../lab2/src/utils/tree/buildTree';
import { outputTreeGraph } from '../lab2/src/utils/tree/output';
import { convertDotToPng } from '../lab2/src/utils/tree/dotToPng';
import { applyCommutativeLaw } from './src/applyCommutativeLaw';
import { applyDistributiveLaw } from './src/applyDistributiveLaw';
import { treeToInfix, verifyTransformation } from './src/verifyTransformation';

async function applyLaws(expressions: string[]) {
  for (const expression of expressions) {
    console.log(`Expression analysis: ${expression}`);
    try {
      const tokens = await tokenize(expression); // tokenization
      const { results, postfixTokens } = await parse(tokens);
      if (results.validness) {
        const expressionTree = await buildExpressionTree(postfixTokens);
        const commutativeTree = await applyCommutativeLaw(expressionTree!);
        const distributiveTree = await applyDistributiveLaw(expressionTree!);
        const graph = outputTreeGraph(expressionTree);
        const commutativeGraph = outputTreeGraph(commutativeTree);
        const distributiveGraph = outputTreeGraph(distributiveTree);
        await convertDotToPng(
          graph!,
          `graph${expressions.indexOf(expression)}`,
        );
        await convertDotToPng(
          commutativeGraph!,
          `commutativeGraph${expressions.indexOf(expression)}`,
        );
        await convertDotToPng(
          distributiveGraph!,
          `distributiveGraph${expressions.indexOf(expression)}`,
        );
        verifyTransformation(expressionTree!, commutativeTree);
        verifyTransformation(expressionTree!, distributiveTree);
        console.log(treeToInfix(expressionTree!));
        console.log(treeToInfix(commutativeTree));
        console.log(treeToInfix(distributiveTree));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Запускаємо аналіз виразу
const testExpressions = [
  //'0/b/c/v/d/e/g*t-v-b-d-s-e-g',
  'a*(b+(c+d)/e)+b*0+5+4-1*n',
  // '0+b*0+0*a+a*b+1',
  // '2+3+4+5+6+7+8*s-p',
  '(a+b+5)*2+0*(0/5-(6+3+d))',
  '3*(b+c)+b*3.45-b*k+3-b*(3.45-k)',
];
(async () => await applyLaws(testExpressions))();
