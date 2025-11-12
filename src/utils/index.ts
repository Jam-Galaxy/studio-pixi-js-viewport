export function useResizeObserver(element: HTMLElement, callback: (width?: number, height?: number) => void) {
  const observerCallback: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    window.requestAnimationFrame((): void | undefined => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      callback(width, height);
    });
  };

  const resizeObserver = new ResizeObserver(observerCallback);
  resizeObserver.observe(element);
  const unobserve = () => resizeObserver.unobserve(element);
  return unobserve;
  }