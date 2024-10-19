import { Token } from './tokenization/tokenize';
import { analyzeExpression } from './optimization/analyzers';
import { ParseError } from './errors/parseError';
import { optimizeExpression } from './optimization/optimize';
import { infixToPostfix } from './tree/postfixConversion';

const sortErrors = (a: ParseError, b: ParseError) =>
  Number(a.message.split(' ')[1].replace(':', '')) -
  Number(b.message.split(' ')[1].replace(':', ''));

export async function parse(tokens: Token[]) {
  const results = await analyzeExpression(tokens);
  const { optimizedTokens, optimizations } = await optimizeExpression(
    results.tokens,
  );
  const postfixTokens = await infixToPostfix(optimizedTokens);

  if (!results.validness && results.errors.length) {
    results.errors.sort(sortErrors);
    const errorMsg = results.errors.join('\n');
    console.log(`Expression has some errors:\n${errorMsg}`);
  } else {
    console.log('Expression is valid');
  }
  if (optimizations.length) {
    console.log('Improvements list:\n', optimizations);
  }
  return { results, postfixTokens };
}
