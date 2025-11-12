import { UniqueId } from "./interfaces/required";

export class Queue<T extends {id: UniqueId}> {
  private _items: T[] = [];
  public get items() {
    return this._items;
  }
  public set items(items: T[]) {
    this._items = items;
  }

  public enqueue(item: T) {
    this._items.push(item);
  }

  public dequeue(): T | undefined {
    return this._items.shift();
  }

  public get length() {
    return this._items.length;
  }

  public isEmpty() {
    return this._items.length === 0;
  }
  public clear() {
    this._items.length = 0;
  }
  /**
   * removes item if it is enqueued
   * @param id item id
   * @returns true if element was in queue or false if was not
   */
  public remove(id: UniqueId): boolean {
    const index = this._items.findIndex(item => item.id === id );
    if(index === -1) {
      return false;
    }
    this._items.splice(index, 1);
    return true;
  }
}