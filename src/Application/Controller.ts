import { useClickAndDrag } from "@/utils/useClickAndDrag";
import { Actions } from "./Actions";
import { Transform2D } from "@foundation/Geometry";
import { useRawUpdatePointer } from "@/utils/useRawUpdatePointer";
import { InteractionSession, InteractionSessionState } from "./services/InteractionSession";
import { InteractionSessionService } from "./services/InteractionSession/InteractionSessionService";

export class Controller {
  private scaleViewport(state: InteractionSessionState, event: PointerEvent, movementX: number, movementY: number, pointerdownEvent: PointerEvent) {
    const timeScaleMultiplier = 0.003;
    const delta = -movementY;
    /**
     * We change the scale so that the changes are uniform. That is, each new change constitutes the same fraction of the current scale. Otherwise, the steps during long-term zooming will be either gigantic or very small.
     * Let's write down the conditions:
     *   S * deltaS1 = S1
     *   S * deltaS2 = S2
     *   S1/S = S2/S1
     * 
     * Now let's express delta2 in terms of delta1:  
     *   deltaS1 = S1/S
     *   S2 = S1*S1/S
     *   deltaS2 = S2/S = S1*S1/S/S = S1/S * S1/S = delta1*delta1
     */
    const deltaSx = (Math.max(0, (delta * timeScaleMultiplier) + 1)) ** 2;
    // console.log(deltaSx);

    let session;
    switch(state) {
      case 'begin': {
        session = this.interactionSessionService.createInteractionSession();
        this.actions.scaleViewport(session, Transform2D.P(pointerdownEvent.x, pointerdownEvent.y));
        break;
      }
      case 'update': {
        session = this.interactionSessionService.getInteractionSession();
        session.state = 'update';
        session.deltaPPU = Transform2D.V(deltaSx, 1);
        this.actions.scaleViewport(session, Transform2D.P(pointerdownEvent.x, pointerdownEvent.y));
        break;
      }
      case 'commit': {
        session = this.interactionSessionService.getInteractionSession();
        session.state = 'commit';
        session.deltaPPU = Transform2D.V(deltaSx, 1);
        this.actions.scaleViewport(session, Transform2D.P(pointerdownEvent.x, pointerdownEvent.y));
        this.interactionSessionService.clearSession();
        break;
      }
    }


    
  }

  constructor(private actions: Actions, private interactionSessionService: InteractionSessionService) {
    useClickAndDrag(document as unknown as HTMLElement, {
      
      startDragCallback: (event: PointerEvent, pointerX: number, pointerY: number) => {
        if(event.button === 0) {
          this.scaleViewport("begin", event, 0, 0, event);
        }
      },
      dragCallback: (event: PointerEvent, pointerX: number, pointerY: number, movementX: number, movementY: number, pointerdownEvent: PointerEvent, movementXFromStart: number, movementYFromStart: number) => {
        if(pointerdownEvent.button === 1) {

          this.actions.dragViewport(event, movementX, movementY);
          // this.actions.dragViewport(event, event.movementX, event.movementY);
        }
        if(pointerdownEvent.button === 0) {
          this.scaleViewport("update", event, movementXFromStart, movementYFromStart, pointerdownEvent);
        }
      },
      endDragCallback: (event, pointerX, pointerY, pointerdownEvent, movementXFromStart, movementYFromStart) => {
        if(pointerdownEvent.button === 0) {
          this.scaleViewport("commit", event, movementXFromStart, movementYFromStart, pointerdownEvent);
        }
      },
    }, {
      useRawUpdateOptions: {
        enableRaw: false,
      }
    });


    const ppuXInput = document.querySelector('#ppu-x') as HTMLInputElement;
    ppuXInput?.addEventListener("blur", (event) => {
      const value = Number((event.target as HTMLInputElement).value);
      this.actions.setPPUX(value);
    });
    const ppuYInput = document.querySelector('#ppu-y') as HTMLInputElement;
    ppuYInput?.addEventListener("blur", (event) => {
      const value = Number((event.target as HTMLInputElement).value);
      this.actions.setPPUY(value);
    });



    // const useRawAddTrue = useRawUpdatePointer({enableRaw: true});
    // let trueCounter = 0;
    // const removeUseRawAddTrue = useRawAddTrue(document as unknown as HTMLElement, (event) => {
    //   console.log(`trueCounter=${trueCounter}`);
    //   trueCounter++;
    // });

    // const useRawAddFalse = useRawUpdatePointer({enableRaw: false});
    // let falseCounter =0;
    // const removeUseRawAddFalse = useRawAddFalse(document as unknown as HTMLElement, (event) => {
    //   console.log(`falseCounter=${falseCounter}`);
    //   falseCounter++;
    // });






  }
}