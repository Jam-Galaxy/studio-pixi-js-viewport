import { Queue } from './Queue';
import { Pool } from './Pool';
import { createWebWorker } from './adapters/WebWorkerAdapter';
import { TaskName, TaskRequest, TaskResponse } from './TaskRegistry/TaskRegistryDerivatives';
import { UniqueId } from './interfaces/required';
import { IWorkerAdapter } from './interfaces/internal/IWorkerAdapter';


type TaskMeta = {
  createdAt: number;
}
/**
 * Formed from TaskRequest
 */
export type QueueTask<T extends TaskName = TaskName> = {
  id: UniqueId;
  request: TaskRequest<T>;
  meta: TaskMeta;
  resolve: (value: TaskResponse<T> | PromiseLike<TaskResponse<T>>) => void;
  reject: (reason?: any) => void;

  batchId?: UniqueId;
};
export type WorkerTask<T extends TaskName = TaskName> = Omit<QueueTask<T>, 'resolve' | 'reject'>

/**
* Facade: task queue -> issue to worker from pool -> wait for response -> return to pool.
 */
export class WorkerOrchestrator {
  private readonly queue = new Queue<QueueTask>();
  private readonly pool: Pool;
  private activeByTaskId: Map<UniqueId, {
    queueTask: QueueTask,
    worker: IWorkerAdapter,
  }>;
  // private activeByBatchId: Map<UniqueId, Set<IWorkerAdapter>>;
  private pumping = false;

  constructor(
    options?: { poolSize?: number }
  ) {
    const size = options?.poolSize ?? 2;
    this.pool = new Pool(size, createWebWorker);
    this.activeByTaskId = new Map();
    // this.activeByBatchId = new Map();
  }

  /** Submitting a task and waiting for the result */
  submit<T extends TaskName = TaskName>(taskRequest: TaskRequest<T>): Promise<TaskResponse<T>> {

    return new Promise<TaskResponse<T>>((resolve, reject) => {
      const queueTask: QueueTask<T> = {
        request: taskRequest,
        id: 'todo',
        meta: {
          createdAt: Date.now(),
        },
        resolve,
        reject
      }
      this.queue.enqueue(queueTask as any);
      this.pump().catch((e) => console.error('[WorkerOrchestrator] pump error', e));
    });
  }

  /** Chief Dispatcher: As long as there are tasks, we issue them to workers. */
  private async pump() {
    if (this.pumping) return;
    this.pumping = true;

    try {
      while (!this.queue.isEmpty()) {
        const worker = await this.pool.acquire(); 
        const queueTask = this.queue.dequeue();
        if(!queueTask) { //queue is possibly cleared while waiting for worker
          this.pool.release(worker);
          return;
        }
        
        this.activeByTaskId.set(queueTask.id, {queueTask, worker});

        // One disposable handler per task
        const onMessage = (event: MessageEvent<TaskResponse>) => {
          console.log("onMessage:", event.data.id, queueTask.id)
          const data = event.data;
          if (!data || data.id !== queueTask.id) return;

          worker.removeEventListener('message', onMessage);
          worker.removeEventListener('error', onError);

          if (data.ok) {
            queueTask.resolve(data);
          } else {
            const err = new Error(data.error?.message ?? 'Worker task failed');
            (err as any).stack = data.error?.stack;
            queueTask.reject(err);
          }

          this.pool.release(worker); //NOTE: release will resolve the promise in the line const worker = await this.pool.acquire();
          this.activeByTaskId.delete(queueTask.id);
        };

        const onError = (ev: ErrorEvent) => {
          worker.removeEventListener('message', onMessage);
          worker.removeEventListener('error', onError);

          queueTask.reject(ev.error ?? new Error(ev.message));
          this.pool.release(worker); //NOTE: release will resolve the promise in the line const worker = await this.pool.acquire();
          this.activeByTaskId.delete(queueTask.id);
        };

        worker.addEventListener('message', onMessage);
        worker.addEventListener('error', onError);
        const workerTask: WorkerTask = {
          request: queueTask.request,
          id: queueTask.id,
          meta: queueTask.meta
        }
        worker.postMessage(workerTask);
      }
    } finally {
      this.pumping = false;
    }
  }
  /**
   * 
   * @param taskId
   * @returns success of dequeue
   */
  private cancelFromQueue(taskId: UniqueId): boolean {
    return this.queue.remove(taskId); //if it is still in queue
  }
  private cancelFromWorker(taskId: UniqueId): boolean {
    const worker = this.activeByTaskId.get(taskId)?.worker;
    if(!worker) {
      return false;
    }
    worker.postMessage({name: "cancel"}); //TODO: implement on worker side
    return true;    
  }
  /** Removes the task from the queue if it is still in the queue, and sends a message to the worker to cancel it if it is already running. */
  cancel(taskId: UniqueId) {
    if(this.cancelFromQueue(taskId)) {
      return;
    }
    if(this.cancelFromWorker(taskId)) {
      return;
    }
    console.warn("Attempt to cancel a task that is not running: could not find the task in the queue or workers. Make sure you are not storing an invalid task id.");
  }
  cancelAll() {
    this.queue.clear();
    for(const taskId of this.activeByTaskId.keys()) {
      this.cancelFromWorker(taskId);
    }
  }
  private cancelFromQueueByBatchId(batchId: UniqueId) {
    this.queue.items = this.queue.items.filter(item => (item.batchId !==undefined && item.batchId !== batchId));
  }
  private cancelFromWorkersByBatchId(batchId: UniqueId) {
    for(const [taskId, item] of this.activeByTaskId.entries()) {
      if(item.queueTask.batchId === batchId) {
        this.cancelFromWorker(taskId);
      }
    }
  }
  cancelByBatchId(batchId: UniqueId) {
    this.cancelFromQueueByBatchId(batchId);
    this.cancelFromWorkersByBatchId(batchId);
  }

  /** Correct completion of the pool (for example, when leaving the page) */
  dispose() {
    this.pool.drainAndTerminate();
  }
}