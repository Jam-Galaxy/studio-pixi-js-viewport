import { Point, Rect, Transform2D } from "@foundation/Geometry";

type CanvasUnitMode = 'css' | 'highdpi'
type Options = {
  canvasUnitMode: CanvasUnitMode;

}

export class CanvasClientMapper { 
private rect!: DOMRect; // border-box 
private contentLeft = 0; // offset of the content-box in the window 
private contentTop = 0; 
private displayWidth = 0; // content-box size in CSS px 
private displayHeight = 0; 
private sx = 1; // canvas pixels per CSS px by X 
private sy = 1; // canvas pixels per CSS px by Y 

private _windowToCanvas!: Transform2D; // window(client) → canvas(px) 
private _canvasToWindow!: Transform2D; // canvas(px) → window(client) 

private _canvasUnitMode: CanvasUnitMode;
public set canvasUnitMode(canvasUnitMode: CanvasUnitMode) {
  this._canvasUnitMode = canvasUnitMode;
  this.update();
}

constructor(private readonly canvas: HTMLCanvasElement, options?: Partial<Options>) { 
this._canvasUnitMode = options?.canvasUnitMode ?? 'css';
this.update();
}

/** Recalculate geometry. Call on resize/scroll/style changes. */
update(): void {
this.rect = this.canvas.getBoundingClientRect();

// Subtract border and padding to move to the content box (where the canvas draws).
const cs = getComputedStyle(this.canvas);
const px = (v: string) => (v ? parseFloat(v) || 0 : 0);

const bl = px(cs.borderLeftWidth), br = px(cs.borderRightWidth);
const bt = px(cs.borderTopWidth), bb = px(cs.borderBottomWidth);
const pl = px(cs.paddingLeft), pr = px(cs.paddingRight);
const pt = px(cs.paddingTop), pb = px(cs.paddingBottom);

this.contentLeft = this.rect.left + bl + pl;
this.contentTop = this.rect.top + bt + pt;

this.displayWidth = Math.max(0, this.rect.width - bl - br - pl - pr);
this.displayHeight = Math.max(0, this.rect.height - bt - bb - pt - pb);

// The ratio between CSS pixels and the canvas's internal pixels.
// If you're using HiDPI settings (width = cssWidth*dpr), then the devicePixelRatio will be automatically taken into account here.
this.sx = this.displayWidth > 0 ? this.canvas.width / this.displayWidth : 1; 
this.sy = this.displayHeight > 0 ? this.canvas.height / this.displayHeight : 1; 

// window(client) → canvas(px): first subtract contentLeft/Top, then scale. 
// M = S * T, where T = translate(-contentLeft, -contentTop), S = scale(sx, sy) 
const T = Transform2D.T(-this.contentLeft, -this.contentTop); 
let S = Transform2D.identity();

if(this._canvasUnitMode === "highdpi") {
  S = Transform2D.S(this.sx, this.sy);
} 

this._windowToCanvas = S.multiplyRight(T); 

// Inverse matrix: canvas(px) → window(client) 
this._canvasToWindow = this._windowToCanvas.invert(); 
} 

/** Matrix window(client) → canvas(px) */ 
get windowToCanvas(): Transform2D { 
  return this._windowToCanvas; 
} 

/** Matrix canvas(px) → window(client) */ 
get canvasToWindow(): Transform2D { 
  return this._canvasToWindow; 
} 

/** Canvas content area in window (client) coordinates as a DOMRect-like object */
get canvasContentRectInWindow(): Readonly<Rect> {
  return { x: this.contentLeft, y: this.contentTop, w: this.displayWidth, h: this.displayHeight };
}
}