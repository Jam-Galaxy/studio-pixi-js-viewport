import { IWorkerAdapter } from "../interfaces/internal/IWorkerAdapter";

export class WebWorkerAdapter extends Worker implements IWorkerAdapter{
  constructor(scriptURL: string | URL, workerOptions?: WorkerOptions) {
    const completedWorkerOptions = {
      type: 'module' as const, //by default
      ...workerOptions,
    }
    super(scriptURL, workerOptions);
  }

  public terminate(): void {
    //TODO: dispose
    super.terminate();
  }

}

export function createWebWorker(): IWorkerAdapter {
  return new Worker(new URL('../worker/entry.worker.ts', import.meta.url), { type: 'module' });
}