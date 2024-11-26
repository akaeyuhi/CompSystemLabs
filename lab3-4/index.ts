import { tokenize } from '../lab2/src/utils/tokenization/tokenize';
import { parse } from '../lab2/src/utils/parser';
import { buildExpressionTree } from '../lab2/src/utils/tree/buildTree';
import { outputTreeGraph } from '../lab2/src/utils/tree/output';
import {
  convertDotToPng,
  prepareOutput,
} from '../lab2/src/utils/tree/dotToPng';
//import { applyCommutativeLaw } from './src/applyCommutativeLaw';
import { applyDistributiveLaw } from './src/applyDistributiveLaw';
import { processResults } from './src/utils/processResults';

async function applyLaws(expressions: string[]) {
  await prepareOutput();
  for (const expression of expressions) {
    console.log(`Expression analysis: ${expression}`);
    try {
      const tokens = await tokenize(expression); // tokenization
      const { results, postfixTokens } = await parse(tokens);
      if (results.validness) {
        const expressionTree = await buildExpressionTree(postfixTokens);
        //const commutativeTrees = await applyCommutativeLaw(expressionTree!);
        const distributiveTrees = await applyDistributiveLaw(expressionTree!);
        const graph = outputTreeGraph(expressionTree);
        await convertDotToPng(
          graph!,
          `graph${expressions.indexOf(expression)}`,
        );
        // await processResults(
        //   'Commutative',
        //   expressionTree!,
        //   commutativeTrees,
        //   expression,
        //   expressions.indexOf(expression),
        // );
        await processResults(
          'Distributive',
          expressionTree!,
          distributiveTrees,
          expression,
          expressions.indexOf(expression),
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Запускаємо аналіз виразу
const testExpressions = [
  //'(a+b+5)*2+0*(0/5-(6+3+d))',
  //'(a+b)*(c-d)/e',
  '3*(b+c)+b*3.45-b*k+3-b*(3.45-k)',
  '(a + b) * (c + d)',
  'a * (b + (c + d))',
];
(async () => await applyLaws(testExpressions))();
