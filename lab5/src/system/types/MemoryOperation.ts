export type MemoryOperation = {
  operation: 'read' | 'write' | 'allocate';
  value?: number;
  address?: number;
};
