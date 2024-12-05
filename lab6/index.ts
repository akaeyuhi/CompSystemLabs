import { tokenize } from '../lab2/src/utils/tokenization/tokenize';
import { parse } from '../lab2/src/utils/parser';
import { buildExpressionTree } from '../lab2/src/utils/tree/buildTree';
import { System } from '../lab5/src/system/system';
import { PerformanceCalculator } from '../lab5/src/system/calculatePerfomance';
import { applyCommutativeLaw } from '../lab3-4/src/applyCommutativeLaw';
import { applyDistributiveLaw } from '../lab3-4/src/applyDistributiveLaw';
import { AnalysisResult, analyzeTree } from './utils/analyzeTree';

async function main(expressions: string[]) {
  const system = new System();
  const analyzer = new PerformanceCalculator(system);

  for (const expression of expressions) {
    console.log(`Analyzing expression: ${expression}`);
    const tokens = await tokenize(expression);
    const { results, optimizedTokens } = await parse(tokens);

    if (results.validness) {
      const originalTree = (await buildExpressionTree(optimizedTokens))!;
      const commutativeTree = await applyCommutativeLaw(originalTree);
      const distributiveTrees = await applyDistributiveLaw(originalTree);

      const results: AnalysisResult[] = [];

      results.push(
        await analyzeTree(system, analyzer, originalTree, 'Original'),
      );

      results.push(
        await analyzeTree(system, analyzer, commutativeTree, 'Commutative'),
      );

      for (let i = 0; i < distributiveTrees.length; i++) {
        const distributiveTree = distributiveTrees[i];
        results.push(
          await analyzeTree(
            system,
            analyzer,
            distributiveTree,
            `Distributive-${i + 1}`,
          ),
        );
      }

      results.forEach(result => {
        console.log(`Result: ${result.type}`);
        console.log(
          `Execution Time: ${result.executionTime} ms, Speedup: ` +
            `${result.speedup}, Efficiency: ${result.efficiency}`,
        );
        console.log('---');
      });

      const bestResult = results.reduce((best, current) =>
        current.executionTime < best.executionTime ? current : best,
      );

      console.log(`Best result: ${bestResult.type}`);
      console.log(
        `Execution Time: ${bestResult.executionTime} ms, Speedup: ` +
          `${bestResult.speedup}, Efficiency: ${bestResult.efficiency}`,
      );
      console.log('---');
    } else {
      console.log(`Invalid expression: ${expression}`);
    }
  }
}

const testExpressions = [
  '(a+b+5)*2+0*(0/5-(6+3+d))',
  '(a+b)*(c-d)/e',
  '3*(b+c)+b*3.45-b*k+3-b*(3.45-k)',
  '(a + b) * (c + d)',
  'a * (b + (c + d))',
];

(async () => await main(testExpressions))();
