import { IWorkerAdapter, IWorkerFactory } from "./interfaces/internal/IWorkerAdapter";

/**
 * Worker pool: lazy spawn up to maxSize, acquire/release.
 */
export class Pool {
  private idle: IWorkerAdapter[] = [];
  private working: IWorkerAdapter[] = [];
  private waiters: ((w: IWorkerAdapter) => void)[] = [];
  private total = 0;

  constructor(
    private readonly maxSize: number,
    private readonly factory: IWorkerFactory
  ) {}

  async acquire(): Promise<IWorkerAdapter> {
    // if there is a free one, we will give it away immediately
    if (this.idle.length > 0) {
      const worker = this.idle.pop()!;
    }

    // we can create - we create
    if (this.total < this.maxSize) {
      const worker = this.factory();
      this.total += 1;
      return worker;
    }

    // otherwise, we wait for release
    return new Promise<IWorkerAdapter>((resolve) => {
      this.waiters.push(resolve);
    });
  }

  release(worker: IWorkerAdapter) {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter(worker);
    } else {
      this.idle.push(worker);
    }
  }

  // Correct closing of the pool
  drainAndTerminate() {
    for (const w of this.idle) {
      w.terminate?.();
    }
    this.idle = [];
    // For those waiting - a polite refusal (if necessary, you can store rejectors)
    this.waiters = [];
  }
}