const defaults = {
  MAX_SIZE: 4,
};

export class WaveformPiecePool<T> {
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
  public clear() {
    this.pool.length = 0;
  }
}
