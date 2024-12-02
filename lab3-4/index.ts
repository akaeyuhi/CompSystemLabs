import { tokenize } from '../lab2/src/utils/tokenization/tokenize';
import { parse } from '../lab2/src/utils/parser';
import { buildExpressionTree } from '../lab2/src/utils/tree/buildTree';
import { outputTreeGraph } from '../lab2/src/utils/tree/output';
import {
  convertDotToPng,
  prepareOutput,
} from '../lab2/src/utils/tree/dotToPng';
import { applyCommutativeLaw } from './src/applyCommutativeLaw';
//import { applyDistributiveLaw } from './src/applyDistributiveLaw';
import { processResults } from './src/utils/processResults';

async function applyLaws(expressions: string[]) {
  await prepareOutput();
  for (const expression of expressions) {
    console.log(`Expression analysis: ${expression}`);
    try {
      const tokens = await tokenize(expression); // tokenization
      const { results, optimizedTokens } = await parse(tokens);
      if (results.validness) {
        const expressionTree = await buildExpressionTree(optimizedTokens);
        const commutativeTree = await applyCommutativeLaw(expressionTree!);
        //const distributiveTrees = await applyDistributiveLaw(expressionTree!);
        const graph = outputTreeGraph(expressionTree);
        await convertDotToPng(
          graph!,
          `graph${expressions.indexOf(expression)}`,
        );
        await processResults(
          'Commutative',
          expressionTree!,
          commutativeTree!,
          expression,
          expressions.indexOf(expression),
        );
        // await processResults(
        //   'Distributive',
        //   expressionTree!,
        //   distributiveTrees,
        //   expression,
        //   expressions.indexOf(expression),
        // );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Запускаємо аналіз виразу
const testExpressions = [
  //Commutative
  'a-b*c+k',
  'A - B*c - L*k*2 + D*t/d*y - H + Q*3 - J*(w-1)/r + P',
  'A-B*c-J*(d*(t*j)-u*t+c*r-1+w-k/q+m*(n-k*s+z*(y+u*p-y/r-5)+x+t/2))/r+P',
  'a + b*c + d + e*(f*g) + h*i + j*(k + L + m*(n-p*q+r) - s*t)',
  // eslint-disable-next-line max-len
  'exp(sin(a+b/2-pi)+a*cos(a*pi+b*pi/3-w+k*t)-5+log(2.72)/T-1)+2048+a+b*c+log(t-1)-2*log(Q)-8*d/dt*exp(t/2+H)-sin(a)/cos(a)',
  //Distributive
  // 'a*(b+c-1)*d',
  // '(a-c)*(b-k+1)',
  // '(1-d)/(a+b-2)/e',
  // 'a-b*(k-t)-(f-g)*(f*5.9-q)-(f+g)/(d+q-w)',
  //'a-b*(k-t+(f-g)*(f*5.9-q)+(w-y*(m-1))/p)-(x-3)*(x+3)/(d+q-w)',
  //Other
  // '(a+b+5)*2+0*(0/5-(6+3+d))',
  // '(a+b)*(c-d)/e',
  // '3*(b+c)+b*3.45-b*k+3-b*(3.45-k)',
  // '(a + b) * (c + d)',
  // 'a * (b + (c + d))',
];
(async () => await applyLaws(testExpressions))();
