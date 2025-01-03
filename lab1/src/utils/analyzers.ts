import { Token } from './tokenize';
import { TokenType } from './getTokenType';
import { ParseError } from './errors';

export class AnalyzeResult {
  token: Token;
  valid: boolean = true;
  errors: ParseError[] = [] as ParseError[];

  constructor(token: Token = {} as Token) {
    this.token = token;
  }
}

const isVariable = (token: Token | undefined) =>
  token &&
  (token.type === TokenType.VARIABLE ||
    token.type === TokenType.NUMBER ||
    token.type === TokenType.CONSTANT ||
    token.type === TokenType.FUNCTION);

const invalidStartCheck = async (tokens: Token[]) => {
  const expression = tokens.map(token => token.value).join('');
  const result = new AnalyzeResult();
  if (expression.match(/^[/*\\)^]/g)) {
    const fistSymbol = expression.slice(0, 1);
    result.errors.push(
      new ParseError(
        `Позиція 0: Недопустимий символ на початку арифметичного виразу: ${fistSymbol}`,
      ),
    );
  }
  if (expression.includes('=')) {
    if (expression.indexOf('=') !== expression.lastIndexOf('=')) {
      result.errors.push(new ParseError(`Два або більше знаків = в виразі`));
    }
    if (expression.indexOf('=') !== 1) {
      result.errors.push(
        new ParseError(`Знак = в виразі стоїть в неправильному місці.`),
      );
    }
  }
  if (result.errors.length) result.valid = false;
  return result;
};

const unknownTokenCheck = async (tokens: Token[]) => {
  const results = [];
  for (const token of tokens) {
    if (token.type === TokenType.UNKNOWN) {
      const result = new AnalyzeResult(token);
      result.errors.push(
        new ParseError(`Позиція ${token.position}: невідомий токен`),
      );
      result.valid = false;
      results.push(result);
    }
  }
  return results;
};

const parenthesesCheck = async (tokens: Token[]) => {
  const result = new AnalyzeResult();
  const stack: Token[] = [];
  for (const token of tokens) {
    if (token.value === '(') {
      stack.push(token);
    } else if (token.value === ')') {
      if (stack.length === 0) {
        result.errors.push(
          new ParseError(`Позиція ${token.position}: зайва закриваюча дужка`),
        );
      } else {
        stack.pop();
      }
    }
  }
  while (stack.length > 0) {
    const openBracket = stack.pop();
    if (openBracket !== undefined) {
      result.errors.push(
        new ParseError(
          `Позиція ${openBracket.position}: зайва відкриваюча дужка`,
        ),
      );
    }
  }
  if (result.errors.length) result.valid = false;
  return result;
};

const doubleOperatorsCheck = async (current: Token, next: Token) => {
  const result = new AnalyzeResult(current);
  if (
    current.type === TokenType.OPERATOR &&
    next?.type === TokenType.OPERATOR
  ) {
    result.errors.push(
      new ParseError(
        `Позиція ${next.position}: оператор ${next.value} після іншого оператора`,
      ),
    );
    result.valid = false;
    return result;
  } else {
    return result;
  }
};

const unnecessaryDotCheck = async (current: Token) => {
  const result = new AnalyzeResult(current);
  if (current.type === TokenType.NUMBER && current.value.startsWith('.')) {
    result.errors.push(
      new ParseError(
        `Позиція ${current.position}: зайва крапка в десятковому виразі`,
      ),
    );
    result.valid = false;
    return result;
  } else {
    return result;
  }
};

const endOperatorCheck = async (current: Token, next: Token) => {
  const result = new AnalyzeResult(current);
  if (
    current.type === TokenType.OPERATOR &&
    !isVariable(next) &&
    next?.type !== TokenType.PARENTHESIS &&
    next?.value !== '(' &&
    next?.type !== TokenType.OPERATOR
  ) {
    result.errors.push(
      new ParseError(
        `Позиція ${current.position}: кінець виразу після оператора, очікувалась змінна`,
      ),
    );
    result.valid = false;
    return result;
  } else {
    return result;
  }
};

const parenAfterOperatorCheck = async (current: Token, next: Token) => {
  const result = new AnalyzeResult(current);
  if (
    current.type === TokenType.OPERATOR &&
    !isVariable(next) &&
    next?.value !== '(' &&
    next?.type === TokenType.PARENTHESIS
  ) {
    result.errors.push(
      new ParseError(
        `Позиція ${current.position}: закриваюча дужка після оператора, очікувалась змінна`,
      ),
    );
    result.valid = false;
    return result;
  } else {
    return result;
  }
};

const tokenWithoutOperation = async (current: Token, next: Token) => {
  const result = new AnalyzeResult(current);
  if (
    (current.type === TokenType.NUMBER ||
      current.type === TokenType.VARIABLE ||
      (current.type === TokenType.PARENTHESIS && current.value === '(')) &&
    next &&
    (next.type === TokenType.NUMBER ||
      next.type === TokenType.VARIABLE ||
      (next.type === TokenType.PARENTHESIS && next.value === ')'))
  ) {
    result.errors.push(
      new ParseError(
        `Позиція ${current.position}: невизначена операція між двома змінними`,
      ),
    );
    result.valid = false;
    return result;
  } else {
    return result;
  }
};

const closingParenthesesCheck = async (current: Token, next: Token) => {
  const result = new AnalyzeResult(current);
  if (
    current.type === TokenType.OPERATOR &&
    next &&
    next.type !== TokenType.PARENTHESIS &&
    next.value === ')'
  ) {
    result.errors.push(
      new ParseError(
        `Позиція ${current.position}: недопустима дужка після оператора, очікувалась змінна`,
      ),
    );
    result.valid = false;
    return result;
  } else {
    return result;
  }
};

const openParenthesesCheck = async (current: Token, next: Token) => {
  const result = new AnalyzeResult(current);
  if (
    current.type === TokenType.PARENTHESIS &&
    current.value === '(' &&
    !isVariable(next)
  ) {
    result.errors.push(
      new ParseError(
        `Позиція ${current.position}: недопустимий знак після дужки, очікувалась змінна`,
      ),
    );
    result.valid = false;
    return result;
  } else {
    return result;
  }
};

const analyzeToken = async (token: Token, next: Token) => {
  const checks = [
    doubleOperatorsCheck,
    endOperatorCheck,
    openParenthesesCheck,
    parenAfterOperatorCheck,
    closingParenthesesCheck,
    tokenWithoutOperation,
    unnecessaryDotCheck,
  ];

  const results = await Promise.all(
    checks.map(check => Promise.resolve(check(token, next))),
  );
  const result = new AnalyzeResult(token);
  for (const res of results) {
    if (!res.valid) {
      result.errors.push(...res.errors);
    }
  }
  if (result.errors.length) {
    result.valid = false;
  }
  return result;
};

const analyzeTokens = async (tokens: Token[]) => {
  const results = [];
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const next = tokens[i + 1];
    results.push(await analyzeToken(current, next));
  }
  return results;
};

export const analyzeExpression = async (tokens: Token[]) => {
  const results = await Promise.all([
    Promise.resolve(invalidStartCheck(tokens)),
    Promise.resolve(unknownTokenCheck(tokens)),
    Promise.resolve(parenthesesCheck(tokens)),
    Promise.resolve(analyzeTokens(tokens)),
  ]);
  const flattedResults = results.flat();
  const errors = flattedResults.map(result => result.errors.flat(1)).flat();
  const validness = flattedResults
    .map(result => result.valid)
    .every(bool => bool);

  return { validness, errors, tokens };
};
