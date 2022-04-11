import { Injectable } from "@angular/core";
import {
  DataQueryResult,
  ECRQuery,
  isDefined,
  isSet,
} from "@worldscapes/common";
import { WorldscapesService } from "./worldscapes.service";
import * as PIXI from "pixi.js";
import { PixiService } from "./pixi.service";
import {combineLatest, filter, Observable, of } from "rxjs";
import {Identity, IdentityService} from "./identity.service";

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  constructor(
    protected worldscapes: WorldscapesService,
    protected pixi: PixiService,
    protected identity: IdentityService
  ) {
  }

  createDataBindingStream<T extends ECRQuery>(query: T): Observable<{
    data: DataQueryResult<T>,
    app: PIXI.Application,
    identity: Identity
  }> {
    return combineLatest({
      data: this.worldscapes.subscribeQuery(query),
      app: this.pixi.getAppAsync().pipe(filter(isDefined)),
      identity: this.identity.identity$.pipe(filter(isSet))
    });
  }

  createInputBindingStream(): Observable<{
    submitInput: WorldscapesService['triggerAction'],
    app: PIXI.Application,
    identity: Identity
  }> {
    return combineLatest({
      submitInput: of(this.worldscapes.triggerAction.bind(this.worldscapes)),
      app: this.pixi.getAppAsync().pipe(filter(isDefined)),
      identity: this.identity.identity$.pipe(filter(isSet))
    });
  }
}
