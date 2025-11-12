//This modules contain various types that provide some useful typing when working with tasks.

import { UniqueId } from "../interfaces/required";
import { TaskRegistry } from "./TaskRegistry";

export type TaskName = keyof TaskRegistry

/**
 * A batchId is used to manage multiple related tasks simultaneously. For example, when changing the scale, all tasks related to rendering the new scale can be combined into a single batch. If the scale changes rapidly, the batchId can be used to cancel all tasks related to this change.
 */
export type TaskRequest<T extends TaskName = TaskName> = T extends TaskName ? {
  name: T;
  payload: TaskRegistry[T]['payload'];
  batchId?: UniqueId;
} : never;

type TaskSuccess<T extends TaskName> = T extends TaskName ? { name: T; id: string; ok: true; result: TaskRegistry[T]['result'] } : never;
type TaskFailure<T extends TaskName> = { name: T; id: string; ok: false; error: { message: string; stack?: string } };
export type TaskResponse<T extends TaskName = TaskName> = TaskSuccess<T> | TaskFailure<T>;

/**
 * type guard
 */
export function isSuccess<T extends TaskName>(taskResponse: TaskResponse<T>): taskResponse is TaskSuccess<T> {
  return taskResponse.ok;
}
