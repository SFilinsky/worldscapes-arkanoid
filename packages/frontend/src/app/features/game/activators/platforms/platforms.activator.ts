import { Component, OnDestroy } from '@angular/core';
import { ComponentPurposes, ComponentSelector, ECRQuery, EntityRequest, isSet, OwnedComponent,
  ResourcePurposes, ResourceRequest } from "@worldscapes/common";
import {
  BallComponent,
  BodyComponent,
  MovePlatformAction,
  PlatformComponent,
  RESOURCE_NAMES,
  SettingsResource
} from '@worldscapes-arkanoid/common';
import { Subject, tap, takeUntil, combineLatest, filter, distinctUntilChanged } from 'rxjs';
import * as PIXI from 'pixi.js';

import { once } from "../../../../utility/operators";
import {WorldscapesService} from "../../../../services/worldscapes.service";
import {PixiService} from "../../../../services/pixi.service";
import {IdentityService} from "../../../../services/identity.service";
import { HttpClient } from '@angular/common/http';

const platformsQuery = ECRQuery.create({
  entity: {
    platforms: new EntityRequest({
      owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
      platform: new ComponentSelector(ComponentPurposes.READ, PlatformComponent),
      body: new ComponentSelector(ComponentPurposes.READ, BodyComponent),
    })
  },
  resource: {
    settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings),
  }
});

const platformHighlightQuery = ECRQuery.create({
  entity: {
    platforms: new EntityRequest({
      owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
      platform: new ComponentSelector(ComponentPurposes.READ, PlatformComponent),
      body: new ComponentSelector(ComponentPurposes.READ, BodyComponent),
    }),
    balls: new EntityRequest({
      ball: new ComponentSelector(ComponentPurposes.READ, BallComponent),
      body: new ComponentSelector(ComponentPurposes.READ, BodyComponent),
    })
  },
  resource: {
    settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings),
  }
});

@Component({
  selector: 'ark-platforms',
  template: ''
})
export class PlatformsActivatorComponent implements OnDestroy {

  platforms!: Record<number, PIXI.Container>;
  highlights!: Record<number, PIXI.Filter>;

  protected ngUnsub$ = new Subject<void>();


  constructor(
    protected worldscapes: WorldscapesService,
    protected pixi: PixiService,
    protected identity: IdentityService,
    protected http: HttpClient,
  ) {

    // Display Platforms
    combineLatest({
      data: this.worldscapes.subscribeQuery(platformsQuery),
      app: this.pixi.getAppAsync(),
      identity: this.identity.identity$,
    })
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(({ data: { resource: { settings } }}) => isSet(settings)),
        once(({ data, app, identity }) => {

          this.platforms = {};

          data.entity.platforms.forEach(platformEntity => {

            const platformContainer = new PIXI.Container();
            platformContainer.width = data.resource.settings!.gameSettings.platformWidth;
            platformContainer.height = data.resource.settings!.gameSettings.platformHeight;
            platformContainer.position.x = platformEntity.body.instance.bounds.min.x;
            platformContainer.position.y = platformEntity.body.instance.bounds.min.y;
            platformContainer.filters = [];

            const platformSprite = PIXI.Sprite.from('assets/platform.png');
            platformSprite.width = data.resource.settings!.gameSettings.platformWidth;
            platformSprite.height = data.resource.settings!.gameSettings.platformHeight;
            platformContainer.addChild(platformSprite);

            app.stage.addChild(platformContainer);
            this.platforms[platformEntity.entityId] = platformContainer;
          });
        }),
        tap(({ data, app }) => {
          data.entity.platforms.forEach(platformEntity => {
            const platform = this.platforms[platformEntity.entityId];
            platform.x = platformEntity.body.instance.bounds.min.x;
            platform.y = platformEntity.body.instance.bounds.min.y;
          })
        })
      )
      .subscribe();

    // Display highlight
    combineLatest({
      data: this.worldscapes.subscribeQuery(platformHighlightQuery),
      app: this.pixi.getAppAsync(),
      identity: this.identity.identity$,
      shaderText: this.http.get('assets/shaders/highlight.glsl', { responseType: 'text' } ),
    })
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(({ data: { entity: { balls }, resource: { settings } }}) => isSet(balls[0]) && isSet(settings) && !!this.platforms),
        once(({ data, app, identity, shaderText }) => {

          const ballEntity = data.entity.balls[0];

          this.highlights = {};

          data.entity.platforms.forEach(platformEntity => {
            const uniforms = {
              iMouse: {
                x: ballEntity.body.instance.position.x,
                y: ballEntity.body.instance.position.y,
              },
              borderColor: [] as number[],
              highlightColor: [ 0.2, 0.2, 1.0 ]
            };

            if (platformEntity.owner.ownerId === identity.id) {
              uniforms.borderColor = [
                110 / 256 / 2,
                227 / 256 / 1.25,
                86 / 256 / 1.5,
              ]
            } else {
              uniforms.borderColor = [
                250 / 256 / 1.5,
                65 / 256 / 1.5,
                47 / 256 / 1.5,
              ]
            }


            console.log(uniforms.borderColor);

            const highlightShader = new PIXI.Filter('', shaderText, uniforms);
            highlightShader.padding = 0;

            this.highlights[platformEntity.entityId] = highlightShader;
            this.platforms[platformEntity.entityId].filters?.push(
              highlightShader
            );
          })
        }),
        distinctUntilChanged((curr, prev) =>
          curr.data.entity.balls[0]!.body.instance.position.x === prev.data.entity.balls[0]!.body.instance.position.x &&
          curr.data.entity.balls[0]!.body.instance.position.y === prev.data.entity.balls[0]!.body.instance.position.y
        ),
        tap(({ data, app }) => {

          const ballEntity = data.entity.balls[0];

          data.entity.platforms.forEach(platformEntity => {

            const shader = this.highlights[platformEntity.entityId];

            shader.uniforms['iMouse'] = {
              x: ballEntity.body.instance.position.x,
              y: ballEntity.body.instance.position.y,
            }

          })
        })
      )
      .subscribe();


    // Setup Movement
    combineLatest({
      app: this.pixi.getAppAsync(),
      identity: this.identity.identity$,
    })
      .pipe(
        takeUntil(this.ngUnsub$),
        once(({ app, identity }) => {
          app.stage.on('pointermove', (event: PIXI.InteractionEvent) => {
            this.worldscapes.triggerAction(new MovePlatformAction(event.data.global.x));
          })
        }),
      )
      .subscribe();

  }

  ngOnDestroy(): void {
    this.ngUnsub$.next();
    this.ngUnsub$.complete();
  }

}

