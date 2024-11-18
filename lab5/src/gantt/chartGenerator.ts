import { LogItem } from 'lab5/src/system/system';

export function generateGanttChart(ganttData: LogItem[]): void {
  ganttData.sort((a, b) => b.start - a.start);

  ganttData.forEach(node => {
    console.log(
      `Processor ${node.operation.executorId} | ${node.operation.description} ` +
        `| Start: ${node.start} | End: ${node.end} | Duration: ${node.end - node.start} ms`,
    );
  });
}
