import { Application, BitmapText, Container } from "pixi.js";
import { TransformProjectionProvider } from "../TransformProjectionProvider";
import { DomEventListener } from "../DomEventListener";

export class Overlay {
  private tpp: TransformProjectionProvider;
  constructor(private pixiApp: Application, transformProjectionProvider: TransformProjectionProvider, private domEventListener: DomEventListener) {
    this.tpp = transformProjectionProvider;
  }
  private addDebugInfo() {
    const debugContanter = new Container({label: "Overlay"});
    
    const debugText = new BitmapText();
    debugText.style.fontSize = 11;
    debugContanter.addChild(debugText);
    this.pixiApp.stage.addChild(debugContanter);

    this.pixiApp.ticker.add((ticker) => {
      // debugText.text = ticker.deltaTime * 0.01;
      const canvasPoint = this.tpp.windowToCanvas(this.domEventListener.pointerPoint);
      const worldPoint = this.tpp.windowToWorld(this.domEventListener.pointerPoint);
      debugText.text = `document:
x:${this.domEventListener.pointerPoint.x}
y:${this.domEventListener.pointerPoint.y}
canvas:
x:${canvasPoint.x}
y:${canvasPoint.y}
world:
x:${worldPoint.x}
y:${worldPoint.y}`;
    });
  }
  public addLayer() {
    this.addDebugInfo();
  }
}