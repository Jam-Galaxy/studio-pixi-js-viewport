import { TaskName, TaskRequest, TaskResponse } from "@/WorkerOrchestrator/TaskRegistry/TaskRegistryDerivatives"
import { WorkerTask } from "@/WorkerOrchestrator/WorkerOrchestrator";

/**
 * In addition to tasks, there may be various auxiliary messages. Therefore, there may be more messages than tasks.
 */
export type MsgToWorker<T extends TaskName = TaskName> = WorkerTask<T>;
export type MsgFromWorker<T extends TaskName = TaskName> = TaskResponse<T>;


export type EventToWorker<T extends TaskName = TaskName> = MessageEvent<MsgToWorker<T>>
export type EventFromWorker<T extends TaskName = TaskName> = MessageEvent<MsgFromWorker<T>>