//import { MemoryError } from '../errors/memoryError';

export class Memory {
  private readonly storage: Map<number, number>;
  private readonly size: number;
  private nextAvailableAddress: number;
  public delays = {
    write: 20,
    read: 15,
    allocate: 5,
  };

  constructor(size: number) {
    this.storage = new Map();
    this.size = size;
    this.nextAvailableAddress = 0; // Start from address 0
  }

  // Write data to memory
  async write(address: number, value: number): Promise<void> {
    if (this.storage.has(address)) {
      //throw new MemoryError(`Memory address ${address} is already in use`);
      // console.warn(
      //   `Warning: Memory address ${address} is already in use and will be overwritten`,
      // );
    }
    await this.delay(this.delays.write);
    this.storage.set(address, value);
  }

  // Read data from memory
  async read(address: number): Promise<number | undefined> {
    await this.delay(this.delays.read);
    const value = this.storage.get(address);
    if (value === undefined) {
      //throw new MemoryError(`No value found at address ${address}`);
      //console.warn(`Warning: No value found at address ${address}`);
    }
    return value;
  }

  // Allocate a new address in memory
  async allocateMemory(value: number): Promise<number> {
    await this.delay(this.delays.allocate);
    if (this.storage.size >= this.size) {
      //throw new MemoryError('Memory is full, cannot allocate new address');
      this.nextAvailableAddress = 0x100;
    }
    return this.nextAvailableAddress + value;
  }

  // Get the size of the memory
  getSize(): number {
    return this.size;
  }

  // Clear the memory (for resetting the system)
  clearMemory(): void {
    this.storage.clear();
    this.nextAvailableAddress = 0x100;
  }

  // Debug: View current memory content
  getMemoryContent(): Map<number, number> {
    return new Map(this.storage);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
