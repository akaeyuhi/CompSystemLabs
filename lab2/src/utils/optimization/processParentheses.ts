import { Token } from '../tokenization/tokenize';

export const processParentheses = async (tokens: Token[]): Promise<Token[]> => {
  const stack: Token[] = [];
  const output: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.value === '(') {
      // Початок підвиразу в дужках
      stack.push(token);
    } else if (token.value === ')') {
      // Закриття підвиразу в дужках
      while (stack.length > 0 && stack[stack.length - 1].value !== '(') {
        output.push(stack.pop()!); // Додаємо всі оператори до виходу
      }
      stack.pop(); // Видаляємо відкриту дужку '('
    } else {
      output.push(token); // Інші токени додаються до виходу
    }
  }

  // Додаємо всі оператори, що залишилися
  while (stack.length > 0) {
    output.push(stack.pop()!);
  }

  return output;
};
