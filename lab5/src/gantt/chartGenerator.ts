import chalk from 'chalk';

export type LogItem = {
  start: number;
  end: number;
  operation: {
    executorId: string;
    description: string;
  };
};

// Конфігурація кольорів для різних виконавців
const executorColors: Record<string, chalk.Chalk> = {
  Memory: chalk.green,
  System: chalk.blue,
};

const getColor = (executorId: string): chalk.Chalk =>
  executorColors[executorId] || chalk.yellow;

// Функція для генерації діаграми
export function generateGanttChart(logs: LogItem[]): void {
  // Розрахунок часових меж
  const minTime = Math.min(...logs.map(log => log.start));
  const maxTime = Math.max(...logs.map(log => log.end));
  const timeRange = maxTime - minTime;

  // Отримання доступної ширини термінала
  const terminalWidth = Math.max(process.stdout.columns || 80, 20); // Мінімум 20 символів
  const availableWidth = terminalWidth - 30; // Враховуємо місце для тексту

  // Масштаб: 1 символ = кількість мс
  const scale =
    timeRange > availableWidth ? Math.ceil(timeRange / availableWidth) : 1;

  console.log(chalk.bold('Генерація діаграми Ганта:\n'));

  // Вивід шкали часу
  console.log(chalk.bold('Часова шкала:'));
  // eslint-disable-next-line no-confusing-arrow
  const scaleBar = Array.from({ length: availableWidth }, (_, i) =>
    i % 10 === 0 ? '|' : '-',
  ).join('');
  console.log(scaleBar);
  console.log(
    // eslint-disable-next-line no-confusing-arrow
    Array.from({ length: availableWidth }, (_, i) =>
      i % 10 === 0
        ? `${Math.round(i * scale + timeRange)}`.padStart(4, ' ')
        : ' ',
    ).join(''),
  );

  console.log(chalk.bold('\nОперації:\n'));

  // Вивід кожного елемента
  logs.forEach(log => {
    const color = getColor(log.operation.executorId);
    const startPos = Math.round((log.start - minTime) / scale);
    const endPos = Math.round((log.end - minTime) / scale);

    // Побудова рядка діаграми
    const bar = ' '.repeat(startPos) + color('█'.repeat(endPos - startPos));
    const label = `${log.operation.executorId} (${log.operation.description})`;

    console.log(`${bar} ${chalk.dim(label)}`);
  });

  console.log(chalk.bold(`\nЧасовий масштаб: 1 символ = ${scale} мс`));
}
