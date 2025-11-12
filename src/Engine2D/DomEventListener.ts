import { Point, Transform2D } from "@foundation/Geometry";

export class DomEventListener {
  public pointerPoint: Point = Transform2D.P(0, 0);
  private pointerMoveCallback: ((event: PointerEvent) => void) | null = null;
  private subscribeToEvents() {
    this.pointerMoveCallback = (event) => {
      this.pointerPoint.x = event.x;
      this.pointerPoint.y = event.y;
    }
    document.addEventListener("pointermove", this.pointerMoveCallback);
  }  
  constructor() {
    this.subscribeToEvents();
  }
  public destroy() {
    if(this.pointerMoveCallback) {
      document.removeEventListener("pointermove", this.pointerMoveCallback)
    }
  }

}