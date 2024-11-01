import { tokenize } from './utils/tokenize';
import { parse } from './utils/parser';

async function parseExpression(expressions: string[]) {
  for (const expression of expressions) {
    console.log(`Аналіз виразу: ${expression}`);
    try {
      const tokens = await tokenize(expression); // Очікуємо токенізацію
      const results = await parse(tokens);
      if (results) {
        console.dir(results, {
          depth: 5,
        });
      }
    } catch (error) {
      console.error('Помилка:', error);
    }
  }
}

// Запускаємо аналіз виразу
const testExpressions = [
  /* Valid */
  // 'a+(t*5.81 - 12)',
  // eslint-disable-next-line max-len
  // 'a+b*(c*cos(t-a*x)-d*sin(t+a*x)/(4.81*k-q*t))/(d*cos(t+a*y/f+(5.616*x-t))+c*sin(t-a*y*(u-v*i)))',
  // 'a+b*(c-d)/e',
  // '3+5*(2-8)/4',
  // 'y=3+5*(2-8)/4',
  // '2.5*(3+4.81/k-q*t)/(cos(t+a*y/f+(5.616*x-t))+c*sin(t-a*y))',
  // 'a+b^(c*d)-sqrt(x/(y*z))',
  // 'x*(y+z)-sin(a*x)/(cos+(b+y)*tan(c/x))',
  // /* Not valid */
  // 'x*(y+z)-sin()/(cos(b+y)*tan(c/x))',
  // '3+*(2-8)',
  // 'a+b*(c-)/e',
  // '2.5*(3+4.81..2/k-q*t)',
  // 'a+b/ - 4.81/(x*y)',
  // 'x*(y+z-sin(a*x)/(cos(b+y',
  // 'cos(a)*sin(b)-)3/8(/(1+d)',
  '-3+12c*d/e-d*f2/cd*(a+2.2*4)',
  '-(b+c)+cos(1a*baa+1bj_ko2*(j-e))',
  '-a+b2*0-nm',
  'g2*(b-17.3)+(6-cos(5))',
  '-(215.01+312,2)b+(1c)',
];
(async () => await parseExpression(testExpressions))();
