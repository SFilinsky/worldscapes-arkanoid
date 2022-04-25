import { Injectable } from "@angular/core";
import { RESOURCE_NAMES, SettingsResource } from "@worldscapes-arkanoid/common";
import {
  isDefined,
  Resolver,
  ResourcePurposes,
  ResourceRequest,
} from "@worldscapes/common";
import { filter, from, map, Observable, take, tap } from "rxjs";
import { WorldscapesService } from "./worldscapes.service";
import * as PIXI from "pixi.js";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PixiService {

  protected app!: PIXI.Application;

  protected _ready = new Resolver<void>();
  readonly ready = this._ready.promise;

  constructor(
    protected worldscapes: WorldscapesService,
    protected http: HttpClient
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

            // Stars shader
            const bg = new PIXI.Sprite();
            bg.width = this.app.screen.width;
            bg.height = this.app.screen.height;
            this.app.stage.addChild(bg);

            this.http.get('assets/shaders/stars.glsl', { responseType: 'text' } )
              .pipe(
                take(1),
                tap(text => {
                  const startTime = Date.now();

                  const uniforms = {
                    iTime: 0,
                  };

                  setInterval(() => {
                    // console.log(uniforms.iTime.value);
                    uniforms.iTime = Date.now() - startTime;
                  }, 16);

                  const starsShader = new PIXI.Filter('', text, uniforms);

                  bg.filters = [
                    starsShader,
                  ];
                })
              )
              .subscribe()


            this.app.stage.filters = [];
            this._ready.resolve();
          })
        )
        .subscribe();
    })();
  }

  getAppAsync(): Observable<PIXI.Application> {
    return from(this.ready.then(() => this.app)).pipe(filter(isDefined));
  }

  getCanvasAsync(): Observable<HTMLCanvasElement> {
    return this.getAppAsync().pipe(map(app => app.view));
  }
}
