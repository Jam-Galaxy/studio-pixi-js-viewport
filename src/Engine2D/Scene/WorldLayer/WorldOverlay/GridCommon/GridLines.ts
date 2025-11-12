import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { Application, Container, Graphics, Rectangle, Texture, TextureSource, TilingSprite } from "pixi.js";

/**
 * for textures tiling by x and y axises.
 */
const CONTENT_HEIGHT_PX = 8; //px 
type GridLinesStyleConfig = {
  height: number; //px
  majorMark: {
    width: number; //px
    height?: number; //px
    color: string;
  }
  minorMark: {
    width: number;
    height?: number;
    color: string;
  }
}
type GridLinesSpacingConfig = {
  majorMarkStepWorld: number; //world
  majorMarkStepPx: number; //same as majorMarkStepWorld in px for convenient usege
  minorMarkCount: number;
}

export class GridLines {
  private parentContainer: Container;
  private styleConfig: GridLinesStyleConfig;
  private _spacingConfig: GridLinesSpacingConfig | null;

  private graphics: Graphics;
  private tilingSprite: TilingSprite;

  private get spacingConfig() {
    if(!this._spacingConfig) {
      throw new Error;
    }
    return this._spacingConfig;
  }
  constructor(private pixiApp: Application, private viewport: Viewport, private tpp: TransformProjectionProvider,
    parentContainer: Container, styleConfig: GridLinesStyleConfig) {
    this.parentContainer = parentContainer;
    this.styleConfig = styleConfig;
    this._spacingConfig = null;

    this.graphics = new Graphics();
    this.tilingSprite = new TilingSprite();
  }

  private addMajorMark(x: number) {
    this.graphics.beginPath();
    this.graphics.moveTo(x,0);
    this.graphics.lineTo(x, this.styleConfig.majorMark.height ?? CONTENT_HEIGHT_PX);
    this.graphics.stroke({
      width: this.styleConfig.majorMark.width,
      color: this.styleConfig.majorMark.color
    });
  }
  private addMinorMark(x: number) {
    this.graphics.beginPath();
    let startYPx;
    let endYPx;
    if(this.styleConfig.minorMark.height !== undefined) {
      startYPx = this.styleConfig.height - this.styleConfig.minorMark.height
      endYPx = this.styleConfig.height;
    } else {
      startYPx = 0;
      endYPx = CONTENT_HEIGHT_PX;
    }
    this.graphics.moveTo(x, startYPx);
    this.graphics.lineTo(x, endYPx);
    this.graphics.stroke({
      width: this.styleConfig.minorMark.width,
      color: this.styleConfig.minorMark.color,
    });
  }
  private invisibleFill(width: number) {
    this.graphics.beginPath();
    this.graphics.rect(0,0, width, 1);
    this.graphics.fill({
      color: "#00000000",
    });
  }
  private createTileTexture() {
    this.graphics.clear();
    this.addMajorMark(0);
    // const minorMarkStepWorld = majorMarkStepWorld / (grid.minorMarkCount + 1);
    // const minorMarkStepPx = this.tpp.worldToCanvasVector(Transform2D.V(minorMarkStepWorld, 0)).x;
    const minorMarkStepPx = this.spacingConfig.majorMarkStepPx / (this.spacingConfig.minorMarkCount + 1);
    let currentX = minorMarkStepPx;
    for(let i =0; i< this.spacingConfig.minorMarkCount; i++) {
      this.addMinorMark(currentX);
      currentX += minorMarkStepPx
    };
    // this.addMajorMark(graphics, majorMarkStepPx);
    this.invisibleFill(this.spacingConfig.majorMarkStepPx - this.styleConfig.majorMark.width / 2);

    const graphicsBounds = this.graphics.getLocalBounds();
    const texture = this.pixiApp.renderer.generateTexture({
      target: this.graphics,
      textureSourceOptions: {
        scaleMode: "nearest",
        antialias: false,
      },
      frame: new Rectangle(Math.floor(graphicsBounds.x),Math.floor(graphicsBounds.y)+1, Math.ceil(graphicsBounds.width), Math.ceil(graphicsBounds.height)-2),
      
    });
    return texture;
  }
  private setTextureToTilingSprite(texture: Texture<TextureSource<any>>) {
    this.tilingSprite.texture = texture;
    this.tilingSprite.tileScale.x = this.spacingConfig.majorMarkStepPx / texture.width;
  }
  private updateTextureForTilingSprite() {
    const texture = this.createTileTexture();
    const invalidTexture = this.tilingSprite.texture;
    this.setTextureToTilingSprite(texture);
    invalidTexture.destroy();
    this.updatePosition();
  }
  private updateTilingSpriteDimensions(height?: number) {
    this.tilingSprite.width = this.viewport.viewWidthPx;
    this.tilingSprite.height = height?? this.styleConfig.height;
  }
  public addLayer(spacingConfig: GridLinesSpacingConfig) {
    this._spacingConfig = spacingConfig;
    this.parentContainer.addChild(this.tilingSprite);
    this.updateTilingSpriteDimensions();
    this.updateTextureForTilingSprite();
  }
  public onCanvasResize(height?: number) {
    this.updateTilingSpriteDimensions(height);
  }
  private updatePosition() {
    const pointPx = this.tpp.worldToWorldContainer(this.viewport.pose.position);  
    this.tilingSprite.tilePosition.x = -(pointPx.x % this.spacingConfig.majorMarkStepPx) - this.styleConfig.majorMark.width / 2; //INFO: small shift to adjust marks position
  }
  public onViewportMoved() {
    this.updatePosition();
  }
  public onPPUChanged(spacingConfig: GridLinesSpacingConfig) {
    this._spacingConfig = spacingConfig;
    this.updateTextureForTilingSprite();
  }
}