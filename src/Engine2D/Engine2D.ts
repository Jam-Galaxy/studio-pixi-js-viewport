import { Application, BitmapText, Container } from "pixi.js";
import { CanvasClientMapper } from "./CanvasClientMapper";
import { Viewport } from "./Viewport";
import { useResizeObserver } from "../utils";
import { DomEventListener } from "./DomEventListener";
import { Scene } from "./Scene";
import { TransformProjectionProvider } from "./TransformProjectionProvider";
import { Point, Transform2D, Vector } from "@foundation/Geometry";
import { configuration } from "./data/configuration";
import { IGridProvider } from "./interfaces/required/IGridProvider";
import { IEngine2D, ISceneApi } from "./interfaces/provided/IEngine2D";
import { ITPP } from "./interfaces/provided/ITPP";
import { UniqueId } from "./interfaces/required/misc";
import { WaveTrackApi } from "./SceneApi/WaveTrackApi";
import { WaveSegmentApi } from "./SceneApi/WaveSegmentApi";
import { MidiTrackApi } from "./SceneApi/MidiTrackApi";
import { MidiSegmentApi } from "./SceneApi/MidiSegmentApi";
import { ViewModel } from "../ViewModel/ViewModel";
import { InteractionSession } from "@/Application/services/InteractionSession";
import { WorkerOrchestrator } from "@/WorkerOrchestrator";


function getDefaultViewportPositionPx() {
  const pointPx = Transform2D.P(0, -configuration.styles.primaryRuler.height);
  return pointPx;
}

export class Engine2D implements IEngine2D {
  private canvas: HTMLCanvasElement;
  private _container: HTMLElement | null;
  public canvasClientMapper: CanvasClientMapper;

  public viewport: Viewport;
  private pixiApp: Application;
  private _scene: Scene | null;
  private viewModel: ViewModel;

  private domEventListener: DomEventListener;
  private transformProjectionProvider: TransformProjectionProvider;

  private _sceneApi: ISceneApi | null;
  public get sceneApi(): ISceneApi {
    if(!this._sceneApi) {
      throw new Error;
    }
    return this._sceneApi;
  }

  /**
   * For external usage
   */
  public get tpp(): ITPP {
    return this.transformProjectionProvider;
  }


  private unobserve: (() => void) | null = null;

  private get scene(): Scene {
    if(!this._scene) {
      throw new Error;
    }
    return this._scene;
  }
  public get container() {
    if(!this._container) {
      throw new Error;
    }
    return this._container;
  }
  public set container(container: HTMLElement) {
    if(this._container && this._container.contains(this.canvas)) {
      this._container.removeChild(this.canvas)
    }
    this._container = container;
    if(this.unobserve) {
      this.unobserve();
      this.unobserve = null;
    }
    this.pixiApp.resizeTo = container;
    this.unobserve = useResizeObserver(this.container, () => {
      this.onCanvasResize();
    });
    this.container.appendChild(this.canvas);
  }
  constructor(private gridProvider: IGridProvider, viewModel: ViewModel, private workerOrchestrator: WorkerOrchestrator) {
    this.canvas = document.createElement("canvas");
    this.viewModel = viewModel
    this._container = null;

    this.canvasClientMapper = new CanvasClientMapper(this.canvas);

    this.viewport = new Viewport();
    this.pixiApp = new Application();
    
    (globalThis as any).__PIXI_APP__ = this.pixiApp;
    this.domEventListener = new DomEventListener();

    this.transformProjectionProvider = new TransformProjectionProvider(this.canvasClientMapper, this.viewport);
    this.viewport.pose.position = this.transformProjectionProvider.canvasToViewport(getDefaultViewportPositionPx());
    this._scene = null;

    this._sceneApi = null;
  }
  private onCanvasResize() {
    this.pixiApp.resize();

    this.canvasClientMapper.update();
    const canvasRect = this.canvasClientMapper.canvasContentRectInWindow
    
    this.viewport.viewHeightPx = canvasRect.h;
    this.viewport.viewWidthPx = canvasRect.w;
    this.scene.onCanvasResize();
  }
  public async initialize() {
    await this.pixiApp.init({
      canvas: this.canvas,
      background: '#000000',
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      // autoDensity: false,
    });
    
    this._scene = new Scene(this.viewModel, this.pixiApp, this.transformProjectionProvider, this.domEventListener, this.viewport, this.gridProvider, this.workerOrchestrator);
    this.scene.initialize();
    
    this._sceneApi = {
      waveTrack: new WaveTrackApi(),
      waveSegment: new WaveSegmentApi(this.viewModel, this.scene),
      midiTrack: new MidiTrackApi(),
      midiSegment: new MidiSegmentApi(),
    }



    // this.pixiApp.ticker.add(ticker => {
    //   this.moveViewport(Transform2D.V(0.1, 0.2));
    // })
  }
  public destroy() {
    if(this.unobserve) {
      this.unobserve();
    }
    this.domEventListener.destroy();
  }

  public moveViewport(movementWindowPx: Vector) {
    const movementWorld = this.transformProjectionProvider.windowToWorldVector(movementWindowPx);
    this.viewport.translateBy(movementWorld);
    this.scene.onViewportMoved();
  }

  public setPPU({x, y}: {x?: number; y?: number}) {
    if(x !== undefined) {
      this.viewport.ppu.x = x;
    }
    if(y !== undefined) {
      this.viewport.ppu.y = y;
    }
    const interactionSession: InteractionSession = {
      state: 'commit',
      interactionStartMemento: {
        startPosition: Transform2D.P(this.viewport.pose.position.x, this.viewport.pose.position.y),
        startPPU: Transform2D.V(this.viewport.ppu.x, this.viewport.ppu.y),
        auxiliaryOriginWorld: Transform2D.P(0,0),
      },
      deltaPPU: Transform2D.V((x ?? this.viewport.ppu.x) /this.viewport.ppu.x, (y ?? this.viewport.ppu.y) / this.viewport.ppu.y)
    }
    this.scene.onPPUChanged(interactionSession);
  }

  public scaleViewport(interactionSession: InteractionSession, auxiliaryOrigin: Point) {
    const auxiliaryOriginWorld =
      interactionSession.interactionStartMemento.auxiliaryOriginWorld
      ?? (interactionSession.interactionStartMemento.auxiliaryOriginWorld = this.transformProjectionProvider.windowToWorld(auxiliaryOrigin));
    // console.log("auxiliaryOriginWorld=", auxiliaryOriginWorld);
    const deltaPPU = Transform2D.V(interactionSession.deltaPPU.x, interactionSession.deltaPPU.y);
    this.viewport.scale(deltaPPU, interactionSession.interactionStartMemento.startPPU, interactionSession.interactionStartMemento.startPosition, auxiliaryOriginWorld);

    const interactionSessionAdjusted = {
      ...interactionSession,
      deltaPPU: Transform2D.V(interactionSession.interactionStartMemento.startPPU.x/this.viewport.ppu.x, interactionSession.interactionStartMemento.startPPU.y/this.viewport.ppu.y)
    } 
    this.scene.onPPUChanged(interactionSessionAdjusted);
    // console.log(this.viewport.pose.position.x)
  }
  public ppuTest() {
    // this.setPPU({x: configuration.maxPPU.x - 10});
    // this.setPPU({x: configuration.minPPU.x + 10});
    this.setPPU({x: Math.floor(configuration.minPPU.x + (configuration.maxPPU.x - configuration.minPPU.x)/2)});

    let sign = 1;
    this.pixiApp.ticker.add((ticker) => {
      
      const term = 10;

      sign = - sign;
      let newPPUX = this.viewport.ppu.x + sign*term;
      // if(newPPUX > configuration.maxPPU.x) {
      //   newPPUX = configuration.maxPPU.x;

      //   sign = -sign;
      // }
      // if(newPPUX < configuration.minPPU.x) {
      //   newPPUX = configuration.minPPU.x;
      //   sign = -sign;
      // }
      

      this.setPPU({x: newPPUX })
    })
  }
  public moveViewportTest() {
    this.pixiApp.ticker.add((ticker) => {
      this.viewport.translateBy(Transform2D.V(0.001, 0.001));  
    })
  }
}
