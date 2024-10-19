import { Token } from './tokenize';
import { analyzeExpression } from './analyzers';
import { ParseError } from './errors';

const sortErrors = (a: ParseError, b: ParseError) =>
  Number(a.message.split(' ')[1].replace(':', '')) -
  Number(b.message.split(' ')[1].replace(':', ''));

export async function parse(tokens: Token[]) {
  const results = await analyzeExpression(tokens);

  if (!results.validness && results.errors.length) {
    results.errors.sort(sortErrors);
    const errorMsg = results.errors.join('\n');
    console.log(`У виразі наявні помилки:\n${errorMsg}`);
  } else {
    console.log('Вираз коректний');
  }
  return results;
}
