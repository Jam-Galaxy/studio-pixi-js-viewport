import { Application, Container } from "pixi.js";
import { GridZebra } from "./GridZebra";
import { Rect, Transform2D } from "@foundation/Geometry";
import { TracksGrid, IGridProvider } from "@Engine2D/interfaces/required/IGridProvider";
import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { configuration } from "@Engine2D/data/configuration";

/**
 * horizontal lines
 */
export class XAxisLockedLayer {
  private container: Container;
  private gridZebra: GridZebra;

  private _grid: TracksGrid | null = null;
  private get grid() {
    if(!this._grid) {
      throw new Error;
    }
    return this._grid;
  }
  private get containerRect(): Rect {
    return {
      x: 0,
      y: 0,
      w: this.viewport.viewWidthPx,
      h: this.viewport.viewHeightPx,
    }
  }

  constructor(private pixiApp: Application, private parentContainer: Container, private tpp: TransformProjectionProvider,
    private viewport: Viewport,
    private gridProvider: IGridProvider
  ) {
      this.container = new Container({label: "YAxisLockedLayer"});
      const styleConfig = {
        gap: configuration.styles.workarea.tracksZebra.gap,
        primaryBand: {
          color: configuration.styles.workarea.tracksZebra.primaryBand.color,
        },
        secondaryBand: {
          color: configuration.styles.workarea.tracksZebra.secondaryBand.color,
        },
      };
      this.gridZebra = new GridZebra(this.pixiApp, this.viewport, this.tpp, this.container, styleConfig);  
  }
  private addStaticContent() {

  }
  private getGridBandSpacingConfig() {
    const stepWorld = this.grid.primaryBandStep;
    const stepPx = this.tpp.worldToCanvasVector(Transform2D.V(0, stepWorld)).y;

    const spacingConfig = {
      primaryBandStepWorld: stepWorld,
      primaryBandStepPx: stepPx,
    };
    return spacingConfig;
  }
  private addZebra() {
    this.gridZebra.addLayer(this.getGridBandSpacingConfig());
  }
  private addDynamicContent() {
    this._grid = this.gridProvider.getTracksGrid();
    this.addZebra();
  }
  public addLayer() {
    this.parentContainer.addChild(this.container);
    this.addStaticContent();
    this.addDynamicContent();
  }
  public onCanvasResize() {
    this.gridZebra.onCanvasResize();
  }
  public onViewportMoved() {
    this.gridZebra.onViewportMoved();    
  }
  public onPPUChanged() {
    this._grid = this.gridProvider.getTracksGrid();
    this.gridZebra.onPPUChanged(this.getGridBandSpacingConfig());
  }
}