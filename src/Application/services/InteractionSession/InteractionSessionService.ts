import { Engine2D } from "@/Engine2D";
import { InteractionSession } from ".";
import { Transform2D } from "@/foundation/Geometry";

export class InteractionSessionService {
  private session: InteractionSession | null;
  constructor(private engine2D: Engine2D) {
    this.session = null;
  }
  public createInteractionSession(): InteractionSession {
    const session: InteractionSession = {
      state: "begin",
      interactionStartMemento: {
        startPosition: Transform2D.P(this.engine2D.viewport.pose.position.x, this.engine2D.viewport.pose.position.y),
        startPPU: Transform2D.V(this.engine2D.viewport.ppu.x, this.engine2D.viewport.ppu.y),
        auxiliaryOriginWorld: null,
      },
      deltaPPU: Transform2D.V(1,1),
    }
    this.session = session;
    return session
  }
  public getInteractionSession() {
    if(!this.session) {
      throw new Error;
    }
    return this.session;
  }
  public clearSession() {
    this.session = null;
  }
}
