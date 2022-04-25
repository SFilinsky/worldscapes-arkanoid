import { Component, OnDestroy } from '@angular/core';
import { ComponentPurposes, ComponentSelector, ECRQuery, EntityRequest, isSet, ResourcePurposes, ResourceRequest } from "@worldscapes/common";
import {
  BallComponent,
  BodyComponent, CollidedEvent, GameStateResource,
  PREDEFINED_IDS, RESOURCE_NAMES, SettingsResource,
} from '@worldscapes-arkanoid/common';
import {combineLatest, distinct, distinctUntilChanged, filter, Subject, take, tap } from 'rxjs';
import { takeUntil } from 'rxjs';
import * as PIXI from 'pixi.js';

import { once } from "../../../../utility/operators";
import {WorldscapesService} from "../../../../services/worldscapes.service";
import {PixiService} from "../../../../services/pixi.service";
import {AudioService, Sound} from "../../../../services/audio.service";

const ballQuery = ECRQuery.create({
  entity: {
    ball: new EntityRequest({
      ball: new ComponentSelector(ComponentPurposes.READ, BallComponent),
      body: new ComponentSelector(ComponentPurposes.READ, BodyComponent),
    })
  },
  resource: {
    settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings),
    gameState: new ResourceRequest<GameStateResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.gameState)
  }
});

const ballCollisionQuery = ECRQuery.create({
  entity: {
    events: new EntityRequest({
      ball: new ComponentSelector(ComponentPurposes.READ, BallComponent),
      body: new ComponentSelector(ComponentPurposes.READ, BodyComponent),
      event: new ComponentSelector(ComponentPurposes.READ, CollidedEvent),
    })
  },
  resource: {}
});

@Component({
  selector: 'ark-ball',
  template: ''
})
export class BallActivatorComponent implements OnDestroy {

  ballSprite!: PIXI.Sprite;

  bounceSound!: Sound;
  ballSound!: Sound;

  protected ngUnsub$ = new Subject<void>();

  constructor(
    protected worldscapes: WorldscapesService,
    protected pixi: PixiService,
    protected audio: AudioService,
  ) {

    // Create ball sound
    this.audio.isReady()
      .pipe(
        takeUntil(this.ngUnsub$),
        take(1),
        once(() => {
          this.bounceSound = this.audio.createRandomSound(['./assets/audio/bounce_2.wav']);
          this.ballSound = this.audio.createRandomSound(['./assets/audio/ball_sound.wav'], {
            loop: true,
            chain: [
            ]
          });
        })
      )
      .subscribe();

    // Display ball
    combineLatest({
      data: this.worldscapes.subscribeQuery(ballQuery),
      app: this.pixi.getAppAsync(),
    })
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(({ data: { resource: { settings, gameState } }}) => isSet(settings) && isSet(gameState)),

        // Draw ball
        once(({ data, app }) => {

          const ballEntity = data.entity.ball.find(entity => PREDEFINED_IDS.ball === entity.entityId);

          if (!ballEntity) {
            return;
          }

          this.ballSprite = PIXI.Sprite.from('assets/ball.png');
          this.ballSprite.x = ballEntity.body.instance.position.x - data.resource.settings!.gameSettings.ballRadius;
          this.ballSprite.y = ballEntity.body.instance.position.y - data.resource.settings!.gameSettings.ballRadius;
          this.ballSprite.width = 2 * data.resource.settings!.gameSettings.ballRadius;
          this.ballSprite.height = 2 * data.resource.settings!.gameSettings.ballRadius;

          this.ballSprite.filters = [
            new PIXI.filters.NoiseFilter(0.15),
          ];

          app.stage.addChild(this.ballSprite);
        }),

        // Update ball position
        tap(({ data }) => {
          const ballEntity = data.entity.ball.find(entity => PREDEFINED_IDS.ball === entity.entityId);

          if (!ballEntity) {
            return;
          }

          this.ballSprite.x = ballEntity.body.instance.position.x - data.resource.settings!.gameSettings.ballRadius;
          this.ballSprite.y = ballEntity.body.instance.position.y - data.resource.settings!.gameSettings.ballRadius;
          this.ballSprite.width = 2 * data.resource.settings!.gameSettings.ballRadius;
          this.ballSprite.height = 2 * data.resource.settings!.gameSettings.ballRadius;
        }),

        // Move ball fly sound
        tap(({ data }) => {
          this.audio.moveSound(
            this.ballSound,
            data.entity.ball[0].body.instance.position.x,
            data.entity.ball[0].body.instance.position.y
          );
        }),

        // Start/stop ball fly sound
        distinctUntilChanged((prev, curr) => prev.data.resource.gameState!.isStarted === curr.data.resource.gameState!.isStarted),
        tap(({ data }) => {

          if (!data.resource.gameState!.isStarted) {
            this.audio.stopSound(this.ballSound);
          } else {
            this.audio.playSound(this.ballSound);
          }
        }),
      )
      .subscribe();

    // Play sound on ball collisions
    combineLatest({
      data: this.worldscapes.subscribeQuery(ballCollisionQuery),
    })
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(({ data: { entity: { events }}}) => events.length > 0),
        distinct(({ data: { entity: { events }}}) => events[0].event.uniqueStamp),
        tap(({ data: { entity: { events }}}) => {
          this.audio.moveSound(this.bounceSound, events[0].body.instance.position.x, events[0].body.instance.position.y);
          this.audio.playSound(this.bounceSound);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.ngUnsub$.next();
    this.ngUnsub$.complete();
  }

}

