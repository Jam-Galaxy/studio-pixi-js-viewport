import { Scope } from "../entry.worker";
import { EventToWorker, MsgFromWorker } from "../interfaces/required";

export class WaveformDrawer {
  private self: Scope;

  constructor(self: Scope) {
    this.self = self;
    this.self.addEventListener("message", (event: EventToWorker) => {
      const message = event.data;
      switch(message.request.name) {
        case "drawWaveform": {
          this.drawWaveformHandler(event as EventToWorker<"drawWaveform">);
          break;
        }
        case "cancel": {
          this.cancelHandler(event as EventToWorker<"cancel">);
          break;
        }
      }
    })
  }

  private drawWaveformHandler(event: EventToWorker<"drawWaveform">) {
    //TODO: draw waveform on offscreen canvas with pixi.js. Then share or transfer ready texture to main thread
    const message = event.data;
    const response: MsgFromWorker = {
      name: "drawWaveform",
      id: message.id,
      ok: true,
      result: 123, //TODO: 
    }
    this.self.postMessage(response);
  }
  private cancelHandler(event: EventToWorker<"cancel">) {
    //TODO:
  }
}