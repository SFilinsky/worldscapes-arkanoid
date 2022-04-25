import {AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import {filter, interval, map, Subject, take, takeUntil, tap } from 'rxjs';
import {PREDEFINED_IDS} from "@worldscapes-arkanoid/common";

import {WorldscapesService} from "../../services/worldscapes.service";
import {PixiService} from "../../services/pixi.service";
import {IdentityService} from "../../services/identity.service";
import {AudioService, Sound} from "../../services/audio.service";
import {once} from "../../utility/operators";

@Component({
  selector: 'ark-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements AfterViewInit, OnDestroy {

  @ViewChild('displayContainer')
  container!: ElementRef<HTMLElement>;

  latestSnapshot$ = interval()
    .pipe(
      map(() => this.worldscapes.getLatestSnapshot()?.components[PREDEFINED_IDS.ball]),
      // map(() => this.worldscapes.getLatestSnapshot()?.resources[RESOURCE_NAMES.gameState])
    );

  mainTheme!: Sound;

  ngUnsub$ = new Subject<void>();

  constructor(
    public worldscapes: WorldscapesService,
    public pixi: PixiService,
    public element: ElementRef,
    public renderer: Renderer2,
    public identity: IdentityService,
    public audio: AudioService
  ) {}

  ngAfterViewInit(): void {
    this.pixi.getCanvasAsync()
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(canvas => !!canvas),
        tap(canvas => {
          this.renderer.appendChild(this.container.nativeElement, canvas);
        })
      ).subscribe();

    // Create ball sound
    this.audio.isReady()
      .pipe(
        takeUntil(this.ngUnsub$),
        take(1),
        once(() => {
          this.mainTheme = this.audio.createRandomSound(['./assets/audio/main_theme.wav']);
          setTimeout(() => this.audio.playSound(this.mainTheme), 20000);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.ngUnsub$.next();
    this.ngUnsub$.complete();
  }

}
