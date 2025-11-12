import { Scope } from "../entry.worker";

export class WaveformDrawer {
  private self: Scope;
  constructor(self: Scope) {
    this.self = self;
    console.log("WaveformDrawer constructor");
  }
}