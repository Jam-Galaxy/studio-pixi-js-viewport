import { Viewport } from "@Engine2D/Viewport";
import { BitmapText, Container } from "pixi.js";
import { LabelPool } from "./LabelPool";
import { configuration } from "@Engine2D/data/configuration";

type Item = {
  bitmapText: BitmapText;
  xWorld: number;
};

type TextResolver = (xWorld: number) => string;

type GridLabelsSpacingConfig = {
  labelStepWorld: number; //world
  labelStepPx: number; //same as labelStepWorld in px for convenient usege
};

const LABEL_BUFFER_STEPS = 1; // render a bit beyond the viewport to prevent popping

export class GridLabels {
  private container: Container;
  private pool: LabelPool<Item>;
  private activeItems: Item[] = [];
  private _spacingConfig: GridLabelsSpacingConfig | null = null;
  private textResolver: TextResolver;
  private layerAttached = false;

  private get spacingConfig() {
    if(!this._spacingConfig) {
      throw new Error("Spacing config is not initialized");
    }
    return this._spacingConfig;
  }
  constructor(private parentContainer: Container, private viewport: Viewport, textResolver: TextResolver) {
    this.container = new Container({label: "GridLabels"});
    this.pool = new LabelPool<Item>();
    this.textResolver = textResolver;
  }
  public addLayer(spacingConfig: GridLabelsSpacingConfig) {
    this._spacingConfig = spacingConfig;
    if(!this.layerAttached) {
      this.parentContainer.addChild(this.container);
      this.layerAttached = true;
    }
    this.updateVisibleLabels(true);
  }
  public onViewportMoved() {
    this.updateVisibleLabels();
  }
  public onPPUChanged(spacingConfig?: GridLabelsSpacingConfig) {
    if(spacingConfig) {
      this._spacingConfig = spacingConfig;
    }
    this.updateVisibleLabels(true);
  }
  public onCanvasResize() {
    this.updateVisibleLabels();
  }
  private updateVisibleLabels(forceTextUpdate = false) {
    if(!this._spacingConfig) {
      return;
    }
    const step = this.spacingConfig.labelStepWorld;
    if(step <= 0) {
      this.deactivateAll();
      return;
    }
    const { firstIndex, requiredCount } = this.calculateLabelWindow(step);
    if(requiredCount <= 0) {
      this.deactivateAll();
      return;
    }
    this.syncItemCount(requiredCount);
    let world = firstIndex * step;
    for(let i = 0; i < requiredCount; i++) {
      this.applyItem(this.activeItems[i], world, forceTextUpdate);
      world += step;
    }
  }
  /**
   * @param step world
   */
  private calculateLabelWindow(step: number) {
    const worldRect = this.viewport.worldRect;
    const margin = step * LABEL_BUFFER_STEPS;
    const windowStart = worldRect.x - margin;
    const windowEnd = worldRect.x + worldRect.w + margin;
    const firstIndex = Math.floor(windowStart / step);
    const lastIndex = Math.ceil(windowEnd / step);
    const requiredCount = Math.max(0, lastIndex - firstIndex + 1);
    return { firstIndex, requiredCount };
  }
  private applyItem(item: Item, xWorld: number, forceTextUpdate: boolean) {
    const xPx = this.worldToCanvasX(xWorld);
    if(item.bitmapText.x !== xPx) {
      item.bitmapText.x = xPx;
    }
    if(forceTextUpdate || item.xWorld !== xWorld) {
      const text = this.textResolver(xWorld);
      if(item.bitmapText.text !== text) {
        item.bitmapText.text = text;
      }
    }
    item.xWorld = xWorld;
    if(!item.bitmapText.visible) {
      item.bitmapText.visible = true;
    }
  }
  private worldToCanvasX(xWorld: number) {
    const deltaWorld = xWorld - this.viewport.pose.position.x;
    return deltaWorld * this.viewport.ppu.x;
  }
  private syncItemCount(required: number) {
    while(this.activeItems.length < required) {
      const pooled = this.pool.acquire();
      const item = pooled ?? this.createItem();
      this.activeItems.push(item);
    }
    while(this.activeItems.length > required) {
      const item = this.activeItems.pop();
      if(!item) {
        break;
      }
      item.bitmapText.visible = false;
      this.pool.release(item);
    }
  }
  private createItem(): Item {
    const bitmapText = new BitmapText();
    bitmapText.tint = configuration.styles.rulerTextColor;
    bitmapText.alpha = configuration.styles.rulerTextAlpha;
    bitmapText.style.fontSize = configuration.styles.rulerTextSize;
    bitmapText.style.fontWeight = configuration.styles.rulerTextWeight as any;
    bitmapText.visible = false;
    bitmapText.y = 0;
    bitmapText.roundPixels = true;
    this.container.addChild(bitmapText);
    return {
      bitmapText,
      xWorld: Number.NaN,
    };
  }
  /**
   * returns all elements back to the pool and makes them invisible
   */
  private deactivateAll() {
    while(this.activeItems.length) {
      const item = this.activeItems.pop();
      if(!item) {
        break;
      }
      item.bitmapText.visible = false;
      this.pool.release(item);
    }
  }
}
