import { Token } from '../tokenization/tokenize';
import { TokenType } from '../tokenization/getTokenType';
import { ConversionError } from '../errors/conversionError';

export async function infixToPostfix(tokens: Token[]): Promise<Token[]> {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  // Operator precedence and associativity
  const precedence: { [key: string]: number } = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
  };

  const associativity: { [key: string]: 'L' | 'R' } = {
    '+': 'L',
    '-': 'L',
    '*': 'L',
    '/': 'L',
    '^': 'R', // Right associative (exponentiation)
  };

  tokens.forEach(token => {
    switch (token.type) {
      case TokenType.NUMBER:
      case TokenType.VARIABLE:
      case TokenType.CONSTANT:
        // Numbers, variables, and constants go directly to the output queue
        outputQueue.push(token);
        break;

      case TokenType.FUNCTION:
        operatorStack.push(token); // Functions are pushed onto the stack
        break;

      case TokenType.OPERATOR:
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type === TokenType.OPERATOR &&
          ((associativity[token.value] === 'L' &&
            precedence[token.value] <=
              precedence[operatorStack[operatorStack.length - 1].value]) ||
            (associativity[token.value] === 'R' &&
              precedence[token.value] <
                precedence[operatorStack[operatorStack.length - 1].value]))
        ) {
          outputQueue.push(operatorStack.pop()!); // Pop operators from stack to output queue
        }
        operatorStack.push(token); // Push the current operator onto the stack
        break;

      case TokenType.PARENTHESIS:
        if (token.value === '(') {
          operatorStack.push(token); // Left parenthesis is pushed onto the stack
        } else if (token.value === ')') {
          // Pop operators from stack to output queue until left parenthesis is found
          while (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1].value !== '('
          ) {
            outputQueue.push(operatorStack.pop()!);
          }
          operatorStack.pop(); // Pop the left parenthesis

          // If there's a function on the top of the stack, pop it to the output queue
          if (
            operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1].type === TokenType.FUNCTION
          ) {
            outputQueue.push(operatorStack.pop()!);
          }
        }
        break;

      default:
        throw new ConversionError('Unknown token type: ' + token.type);
    }
  });

  // Pop any remaining operators in the stack to the output queue
  while (operatorStack.length > 0) {
    const op = operatorStack.pop()!;
    if (op.type === TokenType.PARENTHESIS) {
      throw new ConversionError('Mismatched parentheses');
    }
    outputQueue.push(op);
  }

  return outputQueue;
}
