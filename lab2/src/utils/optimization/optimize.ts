import { Token } from '../tokenization/tokenize';

export async function optimizeExpression(
  tokens: Token[],
): Promise<{ optimizedTokens: Token[]; optimizations: string[] }> {
  const optimizedTokens: Token[] = [];
  const optimizations: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];

    // Handle unary minus
    if (
      current.type === 'OPERATOR' &&
      current.value === '-' &&
      (i === 0 || tokens[i - 1].value === '(')
    ) {
      optimizedTokens.push({
        type: 'NUMBER',
        value: '0',
        position: current.position,
      });
      optimizedTokens.push(current);
      optimizations.push(
        `Unary minus: Inserted 0 before "-" at position ${current.position}`,
      );
      continue;
    }

    // Handle multiplication/division by 1
    if (
      current.type === 'OPERATOR' &&
      (current.value === '*' || current.value === '/')
    ) {
      const next = tokens[i + 1];
      if (next && next.type === 'NUMBER' && next.value === '1') {
        optimizations.push(
          `Multiplication/division by 1: Removed operation "${current.value}"` +
            +`at position ${current.position}`,
        );
        i++; // Skip the '1'
        continue;
      }
    }

    // Handle multiplication by 0
    if (current.type === 'OPERATOR' && current.value === '*') {
      const next = tokens[i + 1];
      if (next && next.type === 'NUMBER' && next.value === '0') {
        optimizedTokens.push({
          type: 'NUMBER',
          value: '0',
          position: current.position,
        });
        optimizations.push(
          `Multiplication by 0: Replaced expression with 0 at position ${current.position}`,
        );
        i++; // Skip the '0'
        continue;
      }
    }

    // Handle addition/subtraction of 0
    if (
      current.type === 'OPERATOR' &&
      (current.value === '+' || current.value === '-')
    ) {
      const next = tokens[i + 1];
      if (next && next.type === 'NUMBER' && next.value === '0') {
        optimizations.push(
          `Addition/subtraction of 0: Removed operation "${current.value}"` +
            +`at position ${current.position}`,
        );
        i++; // Skip the operation and '0'
        continue;
      }
    }

    // Handle division of 0 by a variable
    if (current.type === 'OPERATOR' && current.value === '/') {
      const previous = tokens[i - 1];
      if (previous && previous.type === 'NUMBER' && previous.value === '0') {
        optimizedTokens.push({
          type: 'NUMBER',
          value: '0',
          position: current.position,
        });
        optimizations.push(
          `Division of 0: Replaced expression with 0 at position ${current.position}`,
        );
        i++; // Skip the right-hand side operand
        continue;
      }
    }

    // Handle constant folding
    if (current.type === 'NUMBER') {
      const next = tokens[i + 1];
      const afterNext = tokens[i + 2];

      if (
        next &&
        next.type === 'OPERATOR' &&
        afterNext &&
        afterNext.type === 'NUMBER'
      ) {
        const leftValue = parseFloat(current.value);
        const rightValue = parseFloat(afterNext.value);
        let result: number;

        switch (next.value) {
          case '+':
            result = leftValue + rightValue;
            break;
          case '-':
            result = leftValue - rightValue;
            break;
          case '*':
            result = leftValue * rightValue;
            break;
          case '/':
            result = leftValue / rightValue;
            break;
          default:
            result = NaN;
        }

        if (!isNaN(result)) {
          optimizedTokens.push({
            type: 'NUMBER',
            value: result.toString(),
            position: current.position,
          });
          optimizations.push(
            `Constant folding: Replaced "${current.value} ${next.value} ${afterNext.value}"` +
              +` with "${result}" at position ${current.position}`,
          );
          i += 2; // Skip the next two tokens (operator and right operand)
          continue;
        }
      }
    }

    // If no optimization applies, push the token as is
    optimizedTokens.push(current);
  }

  return { optimizedTokens, optimizations };
}
