export type UseRawUpdateOptions = {
  enableRaw: boolean; 
}
const defaultOptions: UseRawUpdateOptions = {
  enableRaw: true,
}

function completeOptionsWithDefaults(options?: Partial<UseRawUpdateOptions>): UseRawUpdateOptions {
  if(!options) {
    return structuredClone(defaultOptions);
  }
  return {
    enableRaw: options.enableRaw ?? defaultOptions.enableRaw,
  }
}

export type RemoveEventListener = () => void;
type AddEventListener = (target: EventTarget, callback: (event: PointerEvent | MouseEvent | TouchEvent) => void) => RemoveEventListener;

type MoveEventType = 'pointerrawupdate' | 'pointermove' | null;
export function useRawUpdatePointer(options?: Partial<UseRawUpdateOptions>): AddEventListener {
  const completedOptions = completeOptionsWithDefaults(options);
  const supportsPointer = 'PointerEvent' in window;
  if(!supportsPointer) {
    console.warn("PointerEvent does not supported. Fallback to mousemove touchmove")
  }
  const supportsRaw = supportsPointer && (
    'onpointerrawupdate' in window ||
    ('onpointerrawupdate' in document.documentElement)
  );
  if(!supportsRaw) {
    console.warn("onpointerrawupdate does not supported. Fallback to pointermove")
  }

  let moveEventType: MoveEventType;
  if(completedOptions.enableRaw && supportsRaw) {
    moveEventType = 'pointerrawupdate';
  } else if(supportsPointer) {
    moveEventType = 'pointermove'
  } else {
    moveEventType = null;
  }

  function addEventListener(target: EventTarget, callback: (event: PointerEvent | MouseEvent | TouchEvent) => void): RemoveEventListener {
    const fallbackCallback = (e: MouseEvent | TouchEvent) => callback((e as any).touches ? (e as any).touches[0] : e);

    if (moveEventType) {
      //@ts-expect-error unknown ts discrepancy
      target.addEventListener(moveEventType, callback, { passive: true });
      // target.addEventListener("pointerrawupdate", callback)
    } else {
      // the deepest fallback — old Mouse/Touch
      target.addEventListener('mousemove', fallbackCallback as any, { passive: true });
      target.addEventListener('touchmove', fallbackCallback as any, { passive: true });
    }
    
    
    function removeEventListener() {
    if (moveEventType) {
      // @ts-expect-error unknown ts discrepancy
      target.removeEventListener(moveEventType, callback);
    } else {
      target.removeEventListener('mousemove', fallbackCallback as any);
      target.removeEventListener('touchmove', fallbackCallback as any);
    }
    }
    return removeEventListener;
  }
  return addEventListener;
}