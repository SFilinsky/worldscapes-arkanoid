import { Injectable } from "@angular/core";
import { isSet } from "@worldscapes/common";
import {combineLatest, map, Observable, ReplaySubject, shareReplay, startWith } from "rxjs";
import * as Tone from "tone";

export interface Sound {
  panner: Tone.Panner3D,
  player: Tone.Player
}

@Injectable()
export class AudioService {

  protected userAllowed$ = new ReplaySubject<true>();
  protected middleSet$ = new ReplaySubject<true>();

  protected started$ = combineLatest([ this.userAllowed$, this.middleSet$ ])
    .pipe(
      map(([ allowed, middle ]) => {
        return allowed;
      }),
      shareReplay()
    );

  protected mapMiddle = {
    posX: 0,
    posY: 0
  };

  protected globalLimiter = new Tone.Limiter(-20).toDestination();

  protected globalReverb = new Tone.Reverb({
    decay: 0.5,
    preDelay: 0.001,
    wet: 0.15
  }).connect(this.globalLimiter);

  protected globalFilter = new Tone.Filter(200, "highpass").connect(this.globalReverb);

  protected mainChannel = new Tone.Channel().connect(this.globalFilter);

  constructor() {}

  createRandomSound(urls: string[], options?: {
    position?: { posX: number, posY: number },
    loop?: boolean,
    chain?: Tone.InputNode[]
  }): Sound {

    const panner = new Tone.Panner3D({
      panningModel: "HRTF",
    }).connect(this.mainChannel);

    const chain: Tone.InputNode[] = [
      ...(options?.chain ?? []),
      panner
    ];

    const url = urls[Math.floor(Math.random() * urls.length)];

    const player: Tone.Player = new Tone.Player({
      url: url,
      loop: !!options?.loop
    }).chain(...chain);

    const sound = {
      panner,
      player
    }

    if (options?.position) {
      this.moveSound(sound, options.position.posX, options.position.posY);
    }

    return sound;
  }

  playSound(sound: Sound, offset?: Tone.Unit.Time): void {
    if (!isSet(sound)) {
      return;
    }

    sound.player.start()
  }

  moveSound(sound: Sound, posX: number, posY: number) {
    if (!isSet(sound)) {
      return;
    }

    sound.panner.positionX.value = (posX - this.mapMiddle.posX) / this.mapMiddle.posX;
    sound.panner.positionY.value = (posY - this.mapMiddle.posY) / this.mapMiddle.posY;
  }

  stopSound(sound: Sound, offset?: Tone.Unit.Time): void {
    if (!isSet(sound)) {
      return;
    }

    sound.player.stop();
  }

  moveListener(posX: number, posY: number): void {
    Tone.Listener.positionX.value = posX;
    Tone.Listener.positionY.value = posY;
  }

  setMapMiddle(posX: number, posY: number): void {
    this.mapMiddle.posX = posX;
    this.mapMiddle.posY = posY;

    this.middleSet$.next(true);
  }

  allowAudio() {
    Tone.start();
    this.userAllowed$.next(true);
  }

  isAllowed(): Observable<boolean> {
    return this.userAllowed$.pipe(
      startWith(false),
    );
  }

  isReady(): Observable<true> {
    return this.started$;
  }

}
