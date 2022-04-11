import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { filter, map, Observable, shareReplay } from "rxjs";

export interface Identity {
  username: string,
  id: string
}

@Injectable()
export class IdentityService {

  readonly identity$: Observable<Identity | null>;

  constructor(
    public route: ActivatedRoute,
  ) {
    this.identity$ = this.route.queryParamMap.pipe(
      filter(data => !!data.get('username') || !!data.get('id')),
      map(data => ({
        username: String(data.get('username')),
        id: String(data.get('id'))
      })),
      shareReplay(1),
    );
  }
}
