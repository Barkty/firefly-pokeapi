export class RequestQueue {
  private queue: Map<string, Promise<any>> = new Map();
  private maxConcurrent: number;
  private currentCount: number = 0;

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If already in queue, return existing promise
    if (this.queue.has(key)) {
      return this.queue.get(key);
    }

    // Wait if at max concurrent requests
    while (this.currentCount >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.currentCount++;

    const promise = fn()
      .finally(() => {
        this.currentCount--;
        this.queue.delete(key);
      });

    this.queue.set(key, promise);
    return promise;
  }

  clear() {
    this.queue.clear();
    this.currentCount = 0;
  }

  getQueueSize() {
    return this.queue.size;
  }
}

export const pokemonRequestQueue = new RequestQueue(10);