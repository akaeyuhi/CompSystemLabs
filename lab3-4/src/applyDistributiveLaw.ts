import { TreeNode } from '../../lab2/src/utils/tree/buildTree';
import { TokenType } from '../../lab2/src/utils/tokenization/getTokenType';

export async function applyDistributiveLaw(node: TreeNode): Promise<TreeNode> {
  // Базовий випадок: якщо це листок, повертаємо його
  if (!node.left && !node.right) {
    return node;
  }

  // Рекурсивно обробляємо ліву та праву гілки
  const left = node.left ? await applyDistributiveLaw(node.left) : undefined;
  const right = node.right ? await applyDistributiveLaw(node.right) : undefined;

  // Розкриття дужок: a * (b + c) -> (a * b) + (a * c)
  if (node.token.value === '*' && right && right.token.value === '+') {
    return {
      token: { type: TokenType.OPERATOR, value: '+', position: -1 },
      left: {
        token: { type: TokenType.OPERATOR, value: '*', position: -1 },
        left,
        right: right.left,
      },
      right: {
        token: { type: TokenType.OPERATOR, value: '*', position: -1 },
        left,
        right: right.right,
      },
    };
  }

  // Розкриття дужок: (a + b) * c -> (a * c) + (b * c)
  if (node.token.value === '*' && left && left.token.value === '+') {
    return {
      token: { type: TokenType.OPERATOR, value: '+', position: -1 },
      left: {
        token: { type: TokenType.OPERATOR, value: '*', position: -1 },
        left: left.left,
        right,
      },
      right: {
        token: { type: TokenType.OPERATOR, value: '*', position: -1 },
        left: left.right,
        right,
      },
    };
  }

  // Повертаємо вузол із модифікованими піддеревами
  return { ...node, left, right };
}
