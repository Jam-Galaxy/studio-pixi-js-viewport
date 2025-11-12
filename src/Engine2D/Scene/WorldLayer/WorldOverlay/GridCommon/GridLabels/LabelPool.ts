const defaults = {
  MAX_SIZE: 30,
};

export class LabelPool<T> {
  private pool: Array<T>;
  constructor(private readonly maxSize = defaults.MAX_SIZE) {
    this.pool = [];
  }
  public acquire(): T | undefined {
    return this.pool.pop();
  }
  public release(item: T) {
    if(this.pool.length < this.maxSize) {
      this.pool.push(item);
    }
  }
  /** @deprecated prefer release(...) */
  public clear() {
    this.pool.length = 0;
  }
}
