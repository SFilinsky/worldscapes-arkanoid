import { Component, OnDestroy } from '@angular/core';
import { Subject, tap, takeUntil, combineLatest, distinct } from 'rxjs';
import {
  ComponentPurposes,
  ComponentSelector,
  ECRQuery,
  EntityRequest,
  OwnedComponent,
} from "@worldscapes/common";
import { PointsComponent } from "@worldscapes-arkanoid/common";
import { KeyboardService } from "../../../../services/keyboard.service";
import {WorldscapesService} from "../../../../services/worldscapes.service";
import {IdentityService} from "../../../../services/identity.service";

const scoreQuery = ECRQuery.create({
  entity: {
    playerScore: new EntityRequest({
      score: new ComponentSelector(ComponentPurposes.READ, PointsComponent),
      owner: new ComponentSelector(ComponentPurposes.READ, OwnedComponent)
    })
  },
  resource: {}
});

@Component({
  selector: 'ark-score',
  template: `<div>
    <div>
      <span class="label"> Your health </span>
      <span> {{ currentScore }} </span>
    </div>
    <span>
      <span class="label"> Opponent's health</span>
      <span> {{ opponentScore }} </span>
    </span>
  </div>`,
  styles: [ `span { font-size: 1.15rem }`, `.label { display: inline-block; min-width: 12rem; }` ]
})
export class ScoreActivatorComponent implements OnDestroy {

  protected ngUnsub$ = new Subject<void>();

  currentScore!: number;
  opponentScore!: number;

  protected gameStateData$ = this.worldscapes.subscribeQuery(scoreQuery).pipe(distinct());

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
          const me = data.entity.playerScore.find(entity => entity.owner.ownerId === identity.id);
          const opponent = data.entity.playerScore.find(entity => entity.owner.ownerId !== identity.id);

          if (me) {
            this.currentScore = me.score.currentPoints;
          }

          if (opponent) {
            this.opponentScore = opponent.score.currentPoints;
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.ngUnsub$.next();
    this.ngUnsub$.complete();
  }

}

