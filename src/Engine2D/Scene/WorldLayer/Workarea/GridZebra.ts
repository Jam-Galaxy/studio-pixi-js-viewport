import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { Application, Container, Graphics, Rectangle, Texture, TextureSource, TilingSprite } from "pixi.js";

/**
 * px, The width that will be used when drawing graphics for subsequent baking into a texture. The actual texture size may vary.
 */
const TILE_WIDTH_PX = 10;

type GridZebraStyleConfig = {
  gap: number;
  primaryBand: {
    color: string;
  };
  secondaryBand: {
    color: string;
  };
};
type GridZebraSpacingConfig = {
  primaryBandStepWorld: number; //world
  primaryBandStepPx: number; //same as primaryBandStepWorld in px for convenient usege
};

export class GridZebra {
  private parentContainer: Container;
  private styleConfig: GridZebraStyleConfig;
  private _spacingConfig: GridZebraSpacingConfig | null;

  private graphics: Graphics;
  private tilingSprite: TilingSprite;

  private get spacingConfig() {
    if (!this._spacingConfig) {
      throw new Error();
    }
    return this._spacingConfig;
  }
  constructor(private pixiApp: Application, private viewport: Viewport, private tpp: TransformProjectionProvider,
    parentContainer: Container, styleConfig: GridZebraStyleConfig) {
    this.parentContainer = parentContainer;
    this.styleConfig = styleConfig;
    this._spacingConfig = null;

    this.graphics = new Graphics();
    this.tilingSprite = new TilingSprite();
  }

  private addBand(y: number, height: number, color: string) {
    if (height <= 0) {
      return;
    }
    this.graphics.beginPath();
    this.graphics.rect(0, y, TILE_WIDTH_PX, height);
    this.graphics.fill({
      color,
    });
  }

  private addBounds(width: number, height: number) {
    this.graphics.beginPath();
    this.graphics.rect(0, 0, width, height);
    this.graphics.fill({
      color: "#00000001",
    });
  }

  private createTileTexture() {
    this.graphics.clear();
    const tileWidth = TILE_WIDTH_PX;
    const tileHeight = this.spacingConfig.primaryBandStepPx * 2;
    
    const gap = this.styleConfig.gap;
    const bandHeight = this.spacingConfig.primaryBandStepPx - gap;

    this.addBounds(tileWidth, tileHeight);

    let currentY = 0;
    this.addBand(currentY, bandHeight, this.styleConfig.primaryBand.color);
    currentY += bandHeight + gap;
    this.addBand(currentY, bandHeight, this.styleConfig.secondaryBand.color);

    const graphicsBounds = this.graphics.getLocalBounds();
    const texture = this.pixiApp.renderer.generateTexture({
      target: this.graphics,
      textureSourceOptions: {
        scaleMode: "nearest",
      },
      frame: new Rectangle(Math.floor(graphicsBounds.x)+1,Math.floor(graphicsBounds.y), Math.ceil(graphicsBounds.width)-2, Math.ceil(graphicsBounds.height)),
      
    });
    return texture;
  }
  private setTextureToTilingSprite(texture: Texture<TextureSource<any>>) {
    this.tilingSprite.texture = texture;
    this.tilingSprite.tileScale.x = 1;
    this.tilingSprite.tileScale.y = (this.spacingConfig.primaryBandStepPx * 2) / texture.height;
  }
  private updateTextureForTilingSprite() {
    const texture = this.createTileTexture();
    this.setTextureToTilingSprite(texture);
  }
  private updateTilingSpriteDimensions() {
    this.tilingSprite.width = this.viewport.viewWidthPx;
    this.tilingSprite.height = this.viewport.viewHeightPx;
  }
  public addLayer(spacingConfig: GridZebraSpacingConfig) {
    this._spacingConfig = spacingConfig;
    this.parentContainer.addChild(this.tilingSprite);
    this.updateTilingSpriteDimensions();
    this.updateTextureForTilingSprite();
    this.updatePosition();
  }
  public onCanvasResize() {
    this.updateTilingSpriteDimensions();
  }
  private updatePosition() {
    const pointPx = this.tpp.worldToWorldContainer(this.viewport.pose.position);
    this.tilingSprite.tilePosition.y = -(pointPx.y % (this.spacingConfig.primaryBandStepPx*2));
  }
  public onViewportMoved() {
    this.updatePosition();
  }
  public onPPUChanged(spacingConfig: GridZebraSpacingConfig) {
    this._spacingConfig = spacingConfig;
    this.updateTextureForTilingSprite();
  }
}
