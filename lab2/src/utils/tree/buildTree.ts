import { Token } from '../tokenization/tokenize';

export type TreeNode = {
  value: string;
  left?: TreeNode;
  right?: TreeNode;
};

export async function buildExpressionTree(
  postfix: Token[],
): Promise<TreeNode | null> {
  const stack: TreeNode[] = [];

  postfix.forEach(token => {
    if (token.type === 'NUMBER' || token.type === 'VARIABLE') {
      stack.push({ value: token.value });
    } else if (token.type === 'OPERATOR') {
      const right = stack.pop()!;
      const left = stack.pop()!;
      stack.push({
        value: token.value,
        left,
        right,
      });
    }
  });

  return stack.pop() || null;
}
