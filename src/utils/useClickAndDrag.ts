import { RemoveEventListener, UseRawUpdateOptions, useRawUpdatePointer } from "./useRawUpdatePointer";

type UseClickAndDragCallbacks = {
  startDragCallback: (event: PointerEvent, pointerX: number, pointerY: number) => void;
  dragCallback: (event: PointerEvent, pointerX: number, pointerY: number, movementX: number, movementY: number, pointerdownEvent: PointerEvent, movementXFromStart: number, movementYFromStart: number) => void;
  endDragCallback: (event: PointerEvent, pointerX: number, pointerY: number, pointerdownEvent: PointerEvent, movementXFromStart: number, movementYFromStart: number) => void;
  clickCallback: (event: PointerEvent, pointerX: number, pointerY: number) => void;
};

type UseClickAndDragOptions = {
  /**
   * true: If the move did not occur, then only clickCallback will be executed. dragCallback startDragCallback endDragCallback will not be executed. If move occured only dragCallback startDragCallback endDragCallback will be executed. clickCallback will not be executed.
   * false: dragCallback startDragCallback endDragCallback allways will be executed. clickCallback only will be executed if no move occures.
   */
  separateClickAndDrag: boolean; //INFO: if true click and drug will be separated so if user only clicks but not drags only clickCallback will be executed;
  // button: number;
  useRawUpdateOptions: UseRawUpdateOptions;
};

export function useClickAndDrag(elementRef: HTMLElement, callbacks: Partial<UseClickAndDragCallbacks>, options?: Partial<UseClickAndDragOptions>) {
  const addRaw = useRawUpdatePointer(options?.useRawUpdateOptions);
  let removeRaw: RemoveEventListener | null = null;

  let pointerMoveHandler: ((event: PointerEvent) => void) | null = null;
  let pointerUpHandler: ((event: PointerEvent) => void) | null = null;
  let isListeningMove = false; //INFO: prevents accidental duplication when pointerup do not emitted but pointer was up and down in fact (examples: context menu call and tab context menu call during dragging)
  let isMoved = false; //INFO: part of implementation for separateClickAndDrag
  let isSubsequentMove = false; //INFO: if not the first move event

  let pointerdownEvent: PointerEvent | null = null;

  let oldClientX: number;
  let oldClientY: number;

  const pointerUpCallback = (event: PointerEvent) => {
    isListeningMove = false;

    if (callbacks.clickCallback && !isMoved) {
      if (pointerdownEvent === null) {
        throw new Error();
      }
      callbacks.clickCallback(pointerdownEvent, event.x, event.y);
    }
    if (callbacks.endDragCallback && (!options?.separateClickAndDrag || (options?.separateClickAndDrag && isMoved))) {
      if (!pointerdownEvent) {
        throw new Error();
      }
      callbacks.endDragCallback(event, event.x, event.y, pointerdownEvent, event.x - pointerdownEvent.x, event.y - pointerdownEvent.y);
    }
    if (pointerMoveHandler) {
      document.removeEventListener("pointermove", pointerMoveHandler);
      pointerMoveHandler = null;
    }
    if(removeRaw) {
      removeRaw();
      removeRaw = null;
    }



    if (pointerUpHandler) {
      document.removeEventListener("pointerup", pointerUpHandler);
      pointerUpHandler = null;
    }
  };
  const elementPointerDownHandler = (event: PointerEvent) => {
    if (isListeningMove) {
      return;
    }
    isListeningMove = true;
    isMoved = false;
    isSubsequentMove = false;

    pointerdownEvent = event;

    oldClientX = event.clientX;
    oldClientY = event.clientY;

    if (callbacks.startDragCallback && !options?.separateClickAndDrag) {
      callbacks.startDragCallback(event, event.x, event.y);
    }
    pointerMoveHandler = (event: PointerEvent) => {
      isMoved = true;

      if (!isSubsequentMove) {
        if (callbacks.startDragCallback && options?.separateClickAndDrag) {
          if (pointerdownEvent === null) {
            throw new Error();
          }
          callbacks.startDragCallback(pointerdownEvent, pointerdownEvent.x, pointerdownEvent.y);
        }
        isSubsequentMove = true;
      }
      const offsetX = event.clientX - oldClientX;
      const offsetY = event.clientY - oldClientY;
      if (!pointerdownEvent) {
        throw new Error();
      }
      if (callbacks.dragCallback) {
        callbacks.dragCallback(event, event.x, event.y, offsetX, offsetY, pointerdownEvent, event.x - pointerdownEvent.x, event.y - pointerdownEvent.y);
      }
      oldClientX = event.clientX;
      oldClientY = event.clientY;
    }
    
    
    // document.addEventListener("pointermove", pointerMoveHandler);
    removeRaw = addRaw(document, pointerMoveHandler as any);


    pointerUpHandler = pointerUpCallback;
    
    document.addEventListener("pointerup", pointerUpHandler);
  }

  elementRef.addEventListener("pointerdown", elementPointerDownHandler);
  
  function destroy() {
    elementRef.removeEventListener("pointerdown", elementPointerDownHandler);
    if (pointerMoveHandler) {
      document.removeEventListener("pointermove", pointerMoveHandler);
      pointerMoveHandler = null;
    }
    if (pointerUpHandler) {
      document.removeEventListener("pointerup", pointerUpHandler);
      pointerUpHandler = null;
    }
  }
  return destroy;
}
