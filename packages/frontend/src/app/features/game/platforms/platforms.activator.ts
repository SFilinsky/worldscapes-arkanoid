import { Component, OnDestroy } from '@angular/core';
import {DisplayService} from "../../../services/display.service";
import {ComponentPurposes, ComponentSelector, ECRQuery, EntityRequest, OwnedComponent} from "@worldscapes/common";
import {
  MovePlatformAction,
  PlatformComponent,
  RectColliderComponent,
  SpatialComponent
} from '@worldscapes-arkanoid/common';
import {catchError, Subject, tap, throwError } from 'rxjs';
import { takeUntil } from 'rxjs';
import * as PIXI from 'pixi.js';
import {once} from "../../../utility/operators";

const platformsQuery = ECRQuery.create({
  entity: {
    platforms: new EntityRequest({
      owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent),
      platform: new ComponentSelector(ComponentPurposes.READ, PlatformComponent),
      spatial: new ComponentSelector(ComponentPurposes.READ, SpatialComponent),
      rect: new ComponentSelector(ComponentPurposes.READ, RectColliderComponent),
    })
  },
  resource: {}
});

@Component({
  selector: 'ark-platform',
  template: ''
})
export class PlatformsActivatorComponent implements OnDestroy {

  platforms: Record<number, PIXI.Sprite> = {};

  protected ngUnsub$ = new Subject<void>();


  constructor(
    protected display: DisplayService
  ) {

    // Create Platforms
    display.createDataBindingStream(platformsQuery)
      .pipe(
        takeUntil(this.ngUnsub$),
        once(({ data, app, identity }) => {
          console.log("Setting up platforms");

          data.entity.platforms.forEach(platformEntity => {

            const platformSprite = PIXI.Sprite.from('assets/platform.png');
            platformSprite.x = platformEntity.spatial.x;
            platformSprite.y = platformEntity.spatial.y;
            platformSprite.width = platformEntity.rect.width;
            platformSprite.height = platformEntity.rect.height;

            const border = new PIXI.Graphics();
            if (platformEntity.owner.ownerId === identity.id) {
              border.lineStyle(2, 0xAAFFAA, 0.5);
            } else {
              border.lineStyle(2, 0xFFAAAA, 0.5);
            }
            border.drawRect(platformSprite.x, platformSprite.y, platformSprite.width, platformSprite.height);
            platformSprite.addChild(new PIXI.Sprite(app.renderer.generateTexture(border)));
            border.destroy();

            app.stage.addChild(platformSprite);
            this.platforms[platformEntity.entityId] = platformSprite;
          });
        }),
        tap(({ data, app }) => {
          data.entity.platforms.forEach(platformEntity => {
            console.log(platformEntity.spatial.x);
            const platformSprite = this.platforms[platformEntity.entityId];
            platformSprite.x = platformEntity.spatial.x;
          })
        }),
        catchError(error => {
          console.error(error);
          return throwError(error);
        }),
      )
      .subscribe();

    //Setup Movement
    this.display.createInputBindingStream()
      .pipe(
        takeUntil(this.ngUnsub$),
        once(({ app, identity, submitInput }) => {
          app.stage.on('pointermove', (event: PIXI.InteractionEvent) => {
            submitInput(new MovePlatformAction(event.data.global.x));
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

