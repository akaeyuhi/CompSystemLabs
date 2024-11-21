import { MemoryError } from '../errors/memoryError';

export class Memory {
  private readonly storage: Map<number, number>;
  private readonly size: number;
  private nextAvailableAddress: number;
  public delays = {
    write: 10,
    read: 3,
    allocate: 5,
  };

  constructor(size: number) {
    if (size <= 0) {
      throw new MemoryError('Memory size must be greater than 0');
    }
    this.storage = new Map();
    this.size = size;
    this.nextAvailableAddress = 0x100; // Start from address 0
  }

  /**
   * Writes a value to a specified memory address.
   * @param address - The memory address to write to.
   * @param value - The value to store at the memory address.
   * @throws MemoryError if the address is invalid.
   */
  async write(address: number, value: number): Promise<void> {
    if (address < 0 || address >= this.size) {
      throw new MemoryError(`Invalid memory address: ${address}`);
    }
    await this.delay(this.delays.write);
    this.storage.set(address, value);
  }

  /**
   * Reads a value from a specified memory address.
   * @param address - The memory address to read from.
   * @returns The value stored at the address, or undefined if not found.
   * @throws MemoryError if the address is invalid.
   */
  async read(address: number): Promise<number | undefined> {
    if (address < 0 || address >= this.size) {
      throw new MemoryError(`Invalid memory address: ${address}`);
    }
    await this.delay(this.delays.read);
    return this.storage.get(address);
  }

  /**
   * Allocates the next available memory address and stores a value.
   * @param value - The value to store at the allocated address.
   * @returns The allocated memory address.
   * @throws MemoryError if memory is full.
   */
  async allocateMemory(value: number): Promise<number> {
    if (this.storage.size >= this.size) {
      throw new MemoryError('Memory is full, cannot allocate new address');
    }

    await this.delay(this.delays.allocate);

    const allocatedAddress = this.nextAvailableAddress + value;
    this.storage.set(allocatedAddress, value);

    // Update next available address (wrap around if needed)
    this.nextAvailableAddress = (this.nextAvailableAddress + 1) % this.size;

    return allocatedAddress;
  }

  /**
   * Gets the total size of the memory.
   * @returns The size of the memory.
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Clears all memory contents and resets memory state.
   */
  clearMemory(): void {
    this.storage.clear();
    this.nextAvailableAddress = 0x100; // Reset to starting address
  }

  /**
   * Returns a copy of the current memory content for debugging.
   * @returns A map of memory addresses and their values.
   */
  getMemoryContent(): Map<number, number> {
    return new Map(this.storage);
  }

  /**
   * Gets the current memory usage as a percentage.
   * @returns The memory usage percentage.
   */
  getUsagePercentage(): number {
    return (this.storage.size / this.size) * 100;
  }

  /**
   * Configures memory delays for read, write, and allocate operations.
   * @param newDelays - An object with updated delay values.
   */
  configureDelays(newDelays: Partial<typeof this.delays>): void {
    this.delays = { ...this.delays, ...newDelays };
  }

  /**
   * Simulates a delay in memory operations.
   * @param ms - The delay in milliseconds.
   * @returns A promise that resolves after the specified delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
