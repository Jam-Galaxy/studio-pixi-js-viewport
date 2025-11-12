import { configuration } from "@Engine2D/data/configuration";
import { BarsGrid, IGridProvider } from "@Engine2D/interfaces/required/IGridProvider";
import { TransformProjectionProvider } from "@Engine2D/TransformProjectionProvider";
import { Viewport } from "@Engine2D/Viewport";
import { Application, Container } from "pixi.js";
import { GridLines } from "../WorldOverlay/GridCommon/GridLines";
import { Rect, Transform2D } from "@foundation/Geometry";

/**
 * vertical lines
 */
export class YAxisLockedLayer {
  private container: Container;
  private gridLines: GridLines;

  private _grid: BarsGrid | null = null;
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
      height: this.containerRect.h,
      majorMark: {
        width: configuration.styles.primaryRuler.majorMark.width,
        // height: this.containerRect.h,
        color: configuration.styles.primaryRuler.majorMark.color,
      },
      minorMark: {
        width: configuration.styles.primaryRuler.minorMark.width,
        // height: this.containerRect.h,
        color: configuration.styles.primaryRuler.minorMark.color,
      }
    };
    this.gridLines = new GridLines(this.pixiApp, this.viewport, this.tpp, this.container, styleConfig);  
  }
  private addStaticContent() {

  }
  private getGridLinesSpacingConfig() {
    const majorMarkStepWorld = this.grid.majorMarkStep * this.grid.secondsPerBar;
    const majorMarkStepPx = this.tpp.worldToCanvasVector(Transform2D.V(majorMarkStepWorld, 0)).x;

    const spacingConfig = {
      majorMarkStepWorld: majorMarkStepWorld,
      majorMarkStepPx: majorMarkStepPx,
      minorMarkCount: this.grid.minorMarkCount,
    };
    return spacingConfig;
  }
  private addLines() {
    this.gridLines.addLayer(this.getGridLinesSpacingConfig());
  }
  private addDynamicContent() {
    this._grid = this.gridProvider.getBarsGrid();
    this.addLines();
  }
  public addLayer() {
    this.parentContainer.addChild(this.container);
    this.addStaticContent();
    this.addDynamicContent();
  }
  public onCanvasResize() {
    this.gridLines.onCanvasResize(this.viewport.viewHeightPx);
  }
  public onViewportMoved() {
    this.gridLines.onViewportMoved();    
  }
  public onPPUChanged() {
    this._grid = this.gridProvider.getBarsGrid();
    this.gridLines.onPPUChanged(this.getGridLinesSpacingConfig());
  }
}