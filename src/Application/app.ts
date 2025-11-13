// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js';
import { Engine2D } from '../Engine2D';
import { Controller } from './Controller';
import { Actions } from './Actions';
import { IGridProvider } from '@Engine2D/interfaces/required/IGridProvider';
import { MockGridProvider } from '@/mocks/MockGridProvider';
import { ViewModel } from '@/ViewModel/ViewModel';
import { MockAudioInspector } from '@/mocks/MockAudioInspector';
import { InteractionSessionService } from './services/InteractionSession/InteractionSessionService';
import { WorkerOrchestrator } from '@/WorkerOrchestrator';

async function example(canvasHolderElement: HTMLElement) {

  // Create a new application
  const app = new Application();
  (globalThis as any).__PIXI_APP__ = app;

  // Initialize the application
  await app.init({
    canvas: document.querySelector("#pixi-canvas") as HTMLCanvasElement,
    background: '#1099bb',

    resizeTo: canvasHolderElement,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    // autoDensity: false,
   });

  // Append the application canvas to the document body
  // document.body.appendChild(app.canvas);

  // Create and add a container to the stage
  const container = new Container();

  app.stage.addChild(container);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create a 5x5 grid of bunnies in the container
  for (let i = 0; i < 25; i++) {
    const bunny = new Sprite(texture);

    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }

  // Create a Graphics object
  let graphics = new Graphics().moveTo(0, 0).lineTo(100, 100).stroke({ color: 0xff0000, });

  // Define the line style (e.g., color, thickness)
  // graphics.stroke({ width: 50, color: 0xff0000 }); // Red line, 5 pixels thick

  // Move to the starting point of the line
  // graphics.moveTo(0, 0);

  // Draw a line to the specified coordinates
  // graphics.lineTo(200, 200);

  // Add the Graphics object to the stage
  app.stage.addChild(graphics);


  // Move the container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Center the bunny sprites in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    container.rotation -= 0.01 * time.deltaTime;
  });

  const resizeHandler = () => {
    app.resize();
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
  } 

  const observerCallback: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    window.requestAnimationFrame((): void | undefined => {
      if (!Array.isArray(entries) || !entries.length) {
        return;
      }
      resizeHandler();
    });
  };

  const resizeObserver = new ResizeObserver(observerCallback);
  resizeObserver.observe(canvasHolderElement);
}

function subscribeToViewModelEvents(viewModel: ViewModel, engine2D: Engine2D) {
  const eE = viewModel.eventEmitter;
  eE.on("addWaveTrack", (payload) => {
    engine2D.sceneApi.waveTrack.addTrack(payload.waveTrack);
  });
  eE.on("addWaveSegment", (payload) => {
    engine2D.sceneApi.waveSegment.addSegment(payload.waveSegment);
  });
}

export async function app() {
  const canvasHolderElement = document.querySelector("#pixi-canvas-holder") as HTMLElement;
  const gridProvider: IGridProvider = new MockGridProvider();

  const viewModel = new ViewModel();

  const workerOrchestrator = new WorkerOrchestrator();
  const engine2D = new Engine2D(gridProvider, viewModel, workerOrchestrator);
  await engine2D.initialize();
  engine2D.container = canvasHolderElement; 

  const audioInspector = new MockAudioInspector();

  subscribeToViewModelEvents(viewModel, engine2D);

  const actions = new Actions(viewModel, engine2D, audioInspector, workerOrchestrator);
  const interactionSessionService = new InteractionSessionService(engine2D);
  const controller = new Controller(actions, interactionSessionService);


  // engine2D.ppuTest();
  // engine2D.moveViewportTest();
  // actions.addMockTrack();
  // await actions.addMockSegment();


  await actions.addMockTracks(1);
  actions.workerTest();
}
