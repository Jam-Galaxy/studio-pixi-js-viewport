import { WaveformDrawer } from "./handlers/WaveformDrawer";

/** alias for long word */
export type Scope = DedicatedWorkerGlobalScope;

new WaveformDrawer(self as Scope);


// make the file a module to avoid merging globals
export {};
