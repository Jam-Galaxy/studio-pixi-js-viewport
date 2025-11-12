import { Container, Graphics } from "pixi.js";
import { BaseTrack } from "./BaseTrack";

export class WaveTrack extends BaseTrack {
  private container: Container;
  private graphics: Graphics;

  constructor(private parentContainer: Container) {
    super();
    this.container = new Container({label: "WaveTrack"});
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    // this.drawByRequest(addTrackRequest);
  }
  // private drawByRequest(addTrackRequest: AddWaveTrackRequest) {
  //   this.graphics.clear();
    
  // }
  public addLayer() {
    this.parentContainer.addChild(this.container);
  }
  public removeLayer() {
    this.parentContainer.removeChild(this.container);
  }
}
