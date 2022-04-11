import { Injectable } from "@angular/core";
import { RESOURCE_NAMES, SettingsResource } from "@worldscapes-arkanoid/common";
import {
  Resolver,
  ResourcePurposes,
  ResourceRequest,
} from "@worldscapes/common";
import { filter, from, map, Observable, take, tap } from "rxjs";
import { WorldscapesService } from "./worldscapes.service";
import * as PIXI from "pixi.js";

@Injectable({
  providedIn: 'root'
})
export class PixiService {

  protected app!: PIXI.Application;

  protected _ready = new Resolver<void>();
  readonly ready = this._ready.promise;

  constructor(
    protected worldscapes: WorldscapesService
  ) {

    (async () => {
      await this.worldscapes.ready;

      await this.worldscapes.subscribeQuery(
        {
          entity: {},
          resource: {
            settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings),
          }
        }
      )
        .pipe(
          filter(state => !!state.resource.settings),
          take(1),
          tap((state) => {
            if (!state?.resource?.settings) {
              return;
            }

            this.app = new PIXI.Application({
              width: state.resource.settings.gameSettings.gameRoomWidth,
              height: state.resource.settings.gameSettings.gameRoomHeight,
            });
            // this.app.renderer.plugins['interaction'].moveWhenInside = true;
            this.app.stage.interactive = true;
            this.app.stage.filters = [
              new PIXI.filters.NoiseFilter(0.15),
              new PIXI.filters.FXAAFilter()
            ];
            this._ready.resolve();
          })
        )
        .subscribe();
    })();
  }

  getAppAsync(): Observable<PIXI.Application | undefined> {
    return from(this.ready.then(() => this.app));
  }

  getCanvasAsync(): Observable<HTMLCanvasElement | undefined> {
    return this.getAppAsync().pipe(map(app => app?.view));
  }
}
