import { Token } from '../tokenization/tokenize';
import { TokenType } from '../tokenization/getTokenType';
import { CalculationError } from '../errors/calculationError';

export async function calculatePostfix(tokens: Token[]): Promise<number> {
  const stack: number[] = [];

  for (const token of tokens) {
    if (token.type === TokenType.NUMBER) {
      // Convert the token value to a number and push it onto the stack
      stack.push(parseFloat(token.value));
    } else if (token.type === TokenType.OPERATOR) {
      // Pop two operands from the stack
      const rightOperand = stack.pop();
      const leftOperand = stack.pop();

      // If there aren't enough operands, throw an error
      if (rightOperand === undefined || leftOperand === undefined) {
        throw new CalculationError('Not enough operands for the operation.');
      }

      let result: number;
      // Perform the operation based on the operator type
      switch (token.value) {
        case '+':
          result = leftOperand + rightOperand;
          break;
        case '-':
          result = leftOperand - rightOperand;
          break;
        case '*':
          result = leftOperand * rightOperand;
          break;
        case '/':
          if (rightOperand === 0) {
            // Handle division by zero
            throw new CalculationError('Division by zero.');
          }
          result = leftOperand / rightOperand;
          break;
        default:
          throw new CalculationError(`Unknown operator: ${token.value}`);
      }

      // Push the result of the operation back onto the stack
      stack.push(result);
    }
  }

  // If the stack doesn't contain exactly one result, the expression is invalid
  if (stack.length !== 1) {
    throw new CalculationError('Invalid expression. Unused operands remain.');
  }

  // Return the final result of the expression
  return stack.pop()!;
}
