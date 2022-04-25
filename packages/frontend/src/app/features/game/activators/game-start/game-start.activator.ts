import { Component, OnDestroy } from '@angular/core';
import { Subject, tap, takeUntil, combineLatest, filter, distinct } from 'rxjs';
import { ECRQuery, ResourcePurposes, ResourceRequest } from "@worldscapes/common";
import {GameStateResource, RESOURCE_NAMES, StartGameAction} from "@worldscapes-arkanoid/common";
import { KeyboardService } from "../../../../services/keyboard.service";
import {WorldscapesService} from "../../../../services/worldscapes.service";
import {IdentityService} from "../../../../services/identity.service";

const gameStateQuery = ECRQuery.create({
  entity: {},
  resource: {
    gameState: new ResourceRequest<GameStateResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.gameState)
  }
});

@Component({
  selector: 'ark-game-start',
  template: `
    <span *ngIf="showStartText">
      Press <span class="key"> Space </span> to <button (click)="start()"> Start </button>
    </span>
    <span *ngIf="showWaitingText">
        Waiting for other player
    </span>
  `,
  styles: [
    `span:not(.key) { font-size: 1.15rem }`,
    `button { font-size: 0.6rem }`
  ]
})
export class GameStartActivatorComponent implements OnDestroy {

  protected ngUnsub$ = new Subject<void>();

  showStartText!: boolean;
  showWaitingText!: boolean;

  protected gameStateData$ = this.worldscapes.subscribeQuery(gameStateQuery).pipe(distinct());

  constructor(
    protected worldscapes: WorldscapesService,
    protected identity: IdentityService,
    protected keyboard: KeyboardService
  ) {

    // Setup popup
    combineLatest({
      data: this.gameStateData$,
      identity: this.identity.identity$
    })
      .pipe(
        takeUntil(this.ngUnsub$),
        tap(({ data, identity }) => {
          const isStarted = data.resource.gameState?.isStarted === true;
          const iDidStart = data.resource.gameState?.playersStarted[identity.id] === true;
          if (isStarted) {
            this.showStartText = false;
            this.showWaitingText = false;
          }
          if (!isStarted && iDidStart) {
            this.showStartText = false;
            this.showWaitingText = true;
          }
          if (!isStarted && !iDidStart) {
            this.showStartText = true;
            this.showWaitingText = false;
          }
        })
      )
      .subscribe();

    // Setup Movement
    combineLatest({
      keyState: this.keyboard.listenKey('Space'),
      data: this.gameStateData$
    })
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(({ data }) => data.resource.gameState?.isStarted === false),
        filter(({ keyState }) => keyState.pressed),
        tap(() => {
          this.start();
        })
      )
      .subscribe();
  }

  start() {
    this.worldscapes.triggerAction(new StartGameAction());
  }

  ngOnDestroy(): void {
    this.ngUnsub$.next();
    this.ngUnsub$.complete();
  }

}

