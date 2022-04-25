import { Component, OnDestroy } from '@angular/core';
import { ECRQuery, isSet, ResourcePurposes, ResourceRequest } from '@worldscapes/common';
import {RESOURCE_NAMES, SettingsResource} from "@worldscapes-arkanoid/common";
import {WorldscapesService} from "../../../../services/worldscapes.service";
import {AudioService} from "../../../../services/audio.service";
import {filter, Subject, take, takeUntil } from 'rxjs';
import {once} from "../../../../utility/operators";

const settingsQuery = ECRQuery.create({
  entity: {},
  resource: {
    settings: new ResourceRequest<SettingsResource, typeof ResourcePurposes.READ>(ResourcePurposes.READ, RESOURCE_NAMES.settings)
  }
});

@Component({
  selector: 'ark-listener',
  template: ``,
})
export class ListenerComponent implements OnDestroy {


  ngUnsub$ = new Subject<void>();

  constructor(
    protected worldscapes: WorldscapesService,
    protected audio: AudioService
  ) {


    this.worldscapes.subscribeQuery(settingsQuery)
      .pipe(
        takeUntil(this.ngUnsub$),
        filter(data => isSet(data.resource.settings)),
        once((data) => {
          this.audio.setMapMiddle(
            data.resource.settings!.gameSettings.gameRoomWidth / 2,
            data.resource.settings!.gameSettings.gameRoomHeight / 2,
          );
        }),
        take(1),
      )
      .subscribe()

  }

  ngOnDestroy(): void {
    this.ngUnsub$.next();
    this.ngUnsub$.complete();
  }
}
