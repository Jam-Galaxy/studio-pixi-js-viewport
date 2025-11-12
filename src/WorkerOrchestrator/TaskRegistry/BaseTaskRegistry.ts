type BaseTaskRegistryEntry = {
  payload: unknown;
  result: unknown;
}
export type EnforceBase<T extends Record<string, BaseTaskRegistryEntry>> = T;