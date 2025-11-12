import { AudioMeta } from "@/Engine2D/interfaces/required/AudioMisc";
import { UniqueId } from "@/Engine2D/interfaces/required/misc";
import { TransformProjectionProvider } from "@/Engine2D/TransformProjectionProvider";
import { Viewport } from "@/Engine2D/Viewport";
import { Range, Transform2D, Vector } from "@/foundation/Geometry";
import { ViewModel } from "@/ViewModel/ViewModel";
import { Container, Graphics } from "pixi.js";
import { WaveformPiece } from "./WaveformPiece";
import { WaveformPiecePool } from "./WaveformPiecePool";
import { belongsToRange } from "@/foundation/Geometry/GeometryFunctions";
import { InteractionSession } from "@/Application/services/InteractionSession";
import { configuration } from "@/Engine2D/data/configuration";
import { WorkerOrchestrator } from "@/WorkerOrchestrator";

export type PiecesPlan = {
  indices: Range;
  pieceWidth: number,
}

/**
 * Map<index of piece, piece>
 */
type ActivePieces = Map<number, WaveformPiece>;
export type WaveformWorldSpace = {
  start: number;
  top: number;
  height: number;
};

export type WaveformStyle = {
  color: string | number;
  alpha?: number;
};

export type WaveformData = {
  meta: AudioMeta;
  buffer: AudioBuffer;
};

export class Waveform {
  private container: Container;
  private pool: WaveformPiecePool<WaveformPiece>;
  private activePieces: ActivePieces;

  // private get heightPx(): number {
  //   const heightPx = this.tpp.windowToWorldVector(Transform2D.V(0, 1)).y - configuration.styles.workarea.tracksZebra.gap;
  //   return heightPx;
  // }
  
  constructor(private parentContainer: Container, private tpp: TransformProjectionProvider, private viewport: Viewport, private viewModel: ViewModel, private id: UniqueId,
    private waveformData: WaveformData,
    private style: WaveformStyle,
    private heightWorld: number,
    private workerOrchestrator: WorkerOrchestrator
  ) {
    this.container = new Container({label: "Waveform"});
    this.pool = new WaveformPiecePool<WaveformPiece>();
    this.activePieces = new Map();
  }

  /**
   * Calculates the window in world units, taking into account the margins.
   */
  private calculateWaveformWindow(): Range {
    const viewportRect = this.viewport.worldRect;
    // const margin = viewportRect.w;
    const margin = 0;
    return {
      start: viewportRect.x - margin,
      end: viewportRect.x + viewportRect.w + margin
    }
  }
  /**
   * Calculates which pieces with which indices fall into the window
   * @param waveformWindow 
   * @returns 
   */
  private decidePieces(waveformWindow: Range): PiecesPlan {
    const vmSegment = this.viewModel.waveSegments.get(this.id);
    if(!vmSegment) {
      throw new Error;
    }
    const pieceWidth = this.viewport.worldRect.w;
    const pieceCount = Math.ceil(vmSegment.segmentDuration / pieceWidth); 
    const startPieceIndex = Math.max(0, Math.floor((waveformWindow.start - vmSegment.segmentStartTime) / pieceWidth));
    const endPieceIndex = Math.min(pieceCount-1, Math.floor((waveformWindow.end  - vmSegment.segmentStartTime) / pieceWidth)); //
    return {
      indices: {
        start: startPieceIndex,
        end: endPieceIndex,
      },
      pieceWidth,
    }
  }
  private releasePiece(key: number) {
    const piece = this.activePieces.get(key);
    this.activePieces.delete(key);
    if(piece) {
      piece.visible = false;
      this.pool.release(piece);
    }

  }
  private releaseAllPieces() {
    for(const key of this.activePieces.keys()) {
      this.releasePiece(key);
    }
  }
  private invalidateAndReleaseActivePieces(indices: Range) {
    for(const [key, value] of this.activePieces.entries()) {
      if(!belongsToRange(key, indices)) {
        this.activePieces.delete(key);
        value.visible = false;
        this.pool.release(value);
      }
    }
  }
  private obtainPieceByPlan(index: number, piecePlan: PiecesPlan): WaveformPiece {
    let piece = this.pool.acquire();

    if(!piece) {
      piece = new WaveformPiece(this.container, this.tpp, this.heightWorld, this.style, this.waveformData, index, piecePlan, this.workerOrchestrator);
      piece.addLayer();
    } else {
      piece.visible = true;
      piece.update(index, piecePlan); // todo data
    }
    return piece;
  }
  private revalidatePieces(piecePlan: PiecesPlan) {
    const indices = piecePlan.indices;
    this.invalidateAndReleaseActivePieces(indices);
    for(let i = indices.start; i<=indices.end; i++) {
      if(!this.activePieces.has(i)) {
        
        const piece = this.obtainPieceByPlan(i, piecePlan);
        this.activePieces.set(i, piece);
      }
    }
  }
  private forceRedraw(piecesPlan: PiecesPlan, forceRedraw: boolean) {
    if(forceRedraw) {
      for(const [key, piece] of this.activePieces.entries()) {
        piece.update(key, piecesPlan);
      }
    }
  }
  private updatePieces(forceRedraw: boolean = false) {
    const waveformWindow = this.calculateWaveformWindow();
    const piecesPlan = this.decidePieces(waveformWindow);
    // console.log("piecesPlan=", piecesPlan);
    this.revalidatePieces(piecesPlan);

    this.forceRedraw(piecesPlan, forceRedraw); 
  }

  public addLayer() {
    this.parentContainer.addChild(this.container);
    this.updatePieces();
  }
  private stretchContainer(deltaPPU: Vector) { 
    this.container.scale.x = 1/deltaPPU.x;
  }
  private stretchStrategy(interactionSession: InteractionSession) {
    switch(interactionSession.state) {
      case 'update': {
        this.stretchContainer(interactionSession.deltaPPU);
        break;
      }
      case 'commit': {
        this.container.scale.x = 1;
        this.releaseAllPieces();
        this.updatePieces();
        break;
      }
    }
  }
  public onPPUChanged(interactionSession: InteractionSession) {
    switch(configuration.performance.waveform.onPPUChangedStrategy) {
      case 'redraw-between-commited': {
        this.releaseAllPieces();
        this.updatePieces(true);
        break;
      }
      case 'stretch-between-commited': {
        this.stretchStrategy(interactionSession);
        break;
      }
    }

  }
  public onViewportMoved() {
    // console.log("waveform onViewportMoved");
    this.updatePieces();
  }

}
