import { getTokenType, TokenType } from './getTokenType';

export type Token = {
  type: TokenType;
  value: string;
  position: number;
};

export async function tokenize(expression: string): Promise<Token[]> {
  const tokens: Token[] = [];
  const tokenRegex = /([a-zA-Z]\w*)|([0-9]*\.?[0-9]+)|([+\-*/^()])|(\s+)/g;
  let match;

  while ((match = tokenRegex.exec(expression)) !== null) {
    if (match[0].trim()) {
      tokens.push({
        type: getTokenType(match[0]),
        value: match[0],
        position: match.index,
      });
    }
  }
  return tokens;
}
