import { WaveformDrawer } from "./handlers/WaveformDrawer";
import { EventToWorker, MsgFromWorker } from "./interfaces/required";

/** alias for long word */
export type Scope = DedicatedWorkerGlobalScope;

new WaveformDrawer(self as Scope);

(self as Scope).addEventListener('message', (ev: EventToWorker) => {
  if (ev.data.request.name === 'task1') {
    const payload = ev.data.request.payload;
    console.log("worker: payload=", payload);

    const eventFromWorker: MsgFromWorker = {
      name: "task1",
      id: ev.data.id,
      ok: true,
      result: 333,
    };

    setTimeout(() => {
      (self as Scope).postMessage(eventFromWorker);
    }, 5000);
  }
});

// Naive prime number calculation - just to occupy the CPU in the worker
function countPrimes(n: number): number {
  let cnt = 0;
  for (let i = 2; i <= n; i++) {
    if (isPrime(i)) cnt++;
  }
  return cnt;
}

function isPrime(x: number): boolean {
  if (x < 2) return false;
  if (x % 2 === 0) return x === 2;
  const lim = Math.floor(Math.sqrt(x));
  for (let d = 3; d <= lim; d += 2) {
    if (x % d === 0) return false;
  }
  return true;
}



// make the file a module to avoid merging globals
export {};
