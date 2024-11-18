import { TokenType } from '../../lab2/src/utils/tokenization/getTokenType';
import { TreeNode } from '../../lab2/src/utils/tree/buildTree';

// Перетворення дерева в інфіксний вираз
export function treeToInfix(node: TreeNode): string {
  if (!node.left && !node.right) {
    return node.token.value; // Листове значення (змінна або константа)
  }

  const left = node.left ? treeToInfix(node.left) : '';
  const right = node.right ? treeToInfix(node.right) : '';
  return `(${left} ${node.token.value} ${right})`;
}

// Обчислення значення дерева
function evaluateTree(
  node: TreeNode,
  variables: Record<string, number> = {},
): number {
  if (!node.left && !node.right) {
    // Якщо це константа
    if (node.token.type === TokenType.NUMBER) {
      return parseFloat(node.token.value);
    }
    // Якщо це змінна
    if (node.token.type === TokenType.VARIABLE) {
      return variables[node.token.value] ?? 0; // Якщо немає значення - використовуємо 0
    }
  }

  const leftValue = evaluateTree(node.left!, variables);
  const rightValue = evaluateTree(node.right!, variables);

  switch (node.token.value) {
    case '+':
      return leftValue + rightValue;
    case '-':
      return leftValue - rightValue;
    case '*':
      return leftValue * rightValue;
    case '/':
      return leftValue / rightValue;
    case '^':
      return leftValue ^ rightValue;
    default:
      throw new Error(`Unsupported operation: ${node.token.value}`);
  }
}

// Перевірка коректності перетворення
export function verifyTransformation(
  originalTree: TreeNode,
  transformedTree: TreeNode,
  testCases: number = 10,
): boolean {
  for (let i = 0; i < testCases; i++) {
    const variables: Record<string, number> = {};

    // Генерація випадкових значень для змінних
    const allVariables = new Set<string>();
    (function collectVariables(node: TreeNode) {
      if (!node.left && !node.right && node.token.type === TokenType.VARIABLE) {
        allVariables.add(node.token.value);
      }
      if (node.left) collectVariables(node.left);
      if (node.right) collectVariables(node.right);
    })(originalTree);

    allVariables.forEach(variable => {
      variables[variable] = Math.random() * 100; // Випадкове значення від 0 до 100
    });

    // Обчислення обох дерев
    const originalResult = evaluateTree(originalTree, variables);
    const transformedResult = evaluateTree(transformedTree, variables);

    // Порівняння результатів
    if (Math.abs(originalResult - transformedResult) > 1e-6) {
      console.error('Перетворення некоректне для набору змінних:', variables);
      return false;
    }
    console.log(originalResult, transformedResult);
  }
  console.log('Перетворення коректне для всіх тестових випадків!');
  return true;
}
