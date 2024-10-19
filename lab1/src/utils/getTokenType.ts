export enum TokenType {
  VARIABLE = 'VARIABLE',
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  FUNCTION = 'FUNCTION',
  CONSTANT = 'CONSTANT',
  PARENTHESIS = 'PARENTHESIS',
  UNKNOWN = 'UNKNOWN',
}

const MATH_CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
};

export function getTokenType(token: string): TokenType {
  if (/^[a-zA-Z]\w*$/.test(token) && !isMathFunction(token))
    return TokenType.VARIABLE;
  if (isMathConstant(token)) return TokenType.CONSTANT;
  if (/^[0-9]*\.?[0-9]+$/.test(token)) return TokenType.NUMBER;
  if (/^[+\-*^/]$/.test(token)) return TokenType.OPERATOR;
  if (/^[()]$/.test(token)) return TokenType.PARENTHESIS;
  if (isMathFunction(token)) return TokenType.FUNCTION;
  return TokenType.UNKNOWN;
}

function isMathFunction(token: string): boolean {
  const mathFunctions = ['sin', 'cos', 'tan', 'log', 'sqrt', 'exp', 'pow'];
  return mathFunctions.includes(token);
}

function isMathConstant(token: string): boolean {
  return token in MATH_CONSTANTS;
}
