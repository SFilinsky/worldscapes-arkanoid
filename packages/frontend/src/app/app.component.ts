import { AfterViewInit, Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import {filter, interval, map, Subject, takeUntil, tap } from 'rxjs';
import { PixiService } from "./services/pixi.service";
import {IdentityService} from "./services/identity.service";
import {WorldscapesService} from "./services/worldscapes.service";

@Component({
  selector: 'ark-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  @ViewChild('displayContainer')
  container!: ElementRef<HTMLElement>;

  title = 'worldscapes-arkanoid';

  latestSnapshot$ = interval()
    .pipe(
      map(() => this.worldscapes.getLatestSnapshot())
    );

  ngUnsub$ = new Subject<void>();

  constructor(
    public worldscapes: WorldscapesService,
    public pixi: PixiService,
    public element: ElementRef,
    public renderer: Renderer2,
    public identity: IdentityService
  ) {
  }

  ngAfterViewInit(): void {
    this.pixi.getCanvasAsync()
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(canvas => !!canvas),
        tap(canvas => {
          this.renderer.appendChild(this.container.nativeElement, canvas);
        })
      ).subscribe();
  }

  ngOnDestroy(): void {
    this.ngUnsub$.next();
    this.ngUnsub$.complete();
  }

}
