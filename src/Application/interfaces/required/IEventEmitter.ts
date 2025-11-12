export type BaseEventMap = Record<string, Array<unknown>>;

type EventListener<EventTypes extends BaseEventMap, EventName extends keyof EventTypes> = (
  ...args: EventTypes[EventName]
) => void
type Unsubscribe = () => void;

export interface IEventEmitter<EventTypes extends BaseEventMap> {
  on<EventName extends keyof EventTypes>(
    event: EventName,
    listener: EventListener<EventTypes, EventName>,
    options?: { once?: boolean },
  ): Unsubscribe;
  un<EventName extends keyof EventTypes>(
    event: EventName,
    listener: EventListener<EventTypes, EventName>,
  ): void;
  once<EventName extends keyof EventTypes>(
    event: EventName,
    listener: EventListener<EventTypes, EventName>,
  ): Unsubscribe;
  unAll(): void;
  emit<EventName extends keyof EventTypes>(eventName: EventName, ...args: EventTypes[EventName]): void;
}