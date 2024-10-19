import { tokenize } from './utils/tokenization/tokenize';
import { parse } from './utils/parser';
import { buildExpressionTree, buildParallelTree } from './utils/tree/buildTree';
import { outputTreeGraph } from './utils/tree/output';
import { convertDotToPng } from './utils/tree/dotToPng';

async function parseExpression(expressions: string[]) {
  for (const expression of expressions) {
    console.log(`Expression analysis: ${expression}`);
    try {
      const tokens = await tokenize(expression); // Очікуємо токенізацію
      const { results, postfixTokens } = await parse(tokens);
      if (results.validness) {
        const expressionTree = await buildExpressionTree(postfixTokens);
        const parallelTree = await buildParallelTree(expressionTree);
        console.dir(parallelTree, {
          depth: 5,
        });
        // console.dir(expressionTree, {
        //   depth: 5,
        // });
        const graph = outputTreeGraph(expressionTree);
        await convertDotToPng(
          graph!,
          `graph${expressions.indexOf(expression)}`,
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Запускаємо аналіз виразу
const testExpressions = [
  /* Valid */
  'a+(t*5.81 - 12)',
  'a+b*(c*cos(t-a*x)-d*sin(t+a*x)/(4.81*k-q*t))/(d*cos(t+a*y/f+(5.616*x-t))+c*sin(t-a*y*(u-v*i)))',
  'a+b*(c-d)/e',
  '3+5*(2-8)/4',
  // 'y=3+5*(2-8)/4',
  // '2.5*(3+4.81/k-q*t)/(cos(t+a*y/f+(5.616*x-t))+c*sin(t-a*y))',
  // 'a+b^(c*d)-sqrt(x/(y*z))',
  // /* Not valid */
  // 'x*(y+z)-sin()/(cos(b+y)*tan(c/x))',
  // '3+*(2-8)',
  // 'a+b*(c-)/e',
  // '2.5*(3+4.81..2/k-q*t)',
  // 'a+b/ - 4.81/(x*y)',
];
(async () => await parseExpression(testExpressions))();
