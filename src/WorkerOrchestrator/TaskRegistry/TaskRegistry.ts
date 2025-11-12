import { EnforceBase } from "./BaseTaskRegistry";

/**
 * Filled in manually. A field must be added for each worker task. Key - the task name. Payload - the data required to complete the task. Result - the resulting data.
 */
export type TaskRegistry = EnforceBase<{
  drawWaveform: {
    payload: {
      field1: number;
    };
    result: number;
  }
  task2: {
    payload: number;
    result: string;
  };
  cancel: {
    payload: null;
    result: null;
  }
}>;