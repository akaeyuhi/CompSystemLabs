export type GanttLog = {
  start: number;
  end: number;
  operation: {
    executorId: string;
    description: string;
  };
};
