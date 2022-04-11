import { Injectable } from '@angular/core';
import {
  SimpleClientAuth,
  SimpleClientSimulation,
  SimpleEngineClient,
  SimpleNetworkClient,
  WebsocketClientNetworkAdapter,
  WorldscapesClientApi
} from '@worldscapes/client';
import {
  DataQueryResult,
  ECRApi,
  ECRQuery,
  Resolver,
  SimpleEcr,
  PlayerAction, isSet, WorldStateSnapshot
} from '@worldscapes/common';
import {filter, Observable, tap } from 'rxjs';
import {IdentityService} from "./identity.service";

@Injectable({
  providedIn: 'root'
})
export class WorldscapesService {

  protected engineClient!: WorldscapesClientApi;
  protected ecr!: ECRApi;

  protected _ready = new Resolver<void>();
  readonly ready = this._ready.promise;

  constructor(
    public identity: IdentityService
  ) {


    this.identity.identity$
      .pipe(
        filter(isSet),
        tap(async identity => {
          const clientAdapter = new WebsocketClientNetworkAdapter(new SimpleClientAuth({ id: identity.id }), '192.168.1.5', 50001);

          await clientAdapter.isReady();

          this.ecr = new SimpleEcr();

          this.engineClient = new SimpleEngineClient(
            new SimpleClientSimulation(this.ecr),
            new SimpleNetworkClient(clientAdapter)
          );

          this.engineClient.start();

          this._ready.resolve();
        })
      )
      .subscribe();
  }

  triggerAction(action: PlayerAction) {
    this.engineClient.onInput(action);
  }

  getLatestSnapshot(): WorldStateSnapshot | undefined {
    return this.engineClient?.getLatestSnapshot();
  }

  subscribeQuery<T extends ECRQuery>(query: T): Observable<DataQueryResult<T>> {
    return new Observable(observer => {
      this.ready.then(() => this.ecr.subscribeDataQuery(query, data => observer.next(data)));
    });
  }
}
