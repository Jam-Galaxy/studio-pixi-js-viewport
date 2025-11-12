export interface IWorkerAdapter extends Worker {
  terminate(): void;
};

export interface IWorkerFactory{
   (): IWorkerAdapter
}