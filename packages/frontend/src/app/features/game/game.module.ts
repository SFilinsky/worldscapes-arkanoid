import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import {GameComponent} from "./game.component";
import {PlatformsActivatorComponent} from "./activators/platforms/platforms.activator";
import {BallActivatorComponent} from "./activators/ball/ball.activator";
import {GameStartActivatorComponent} from "./activators/game-start/game-start.activator";
import {AppRoutingModule} from "../../app-routing.module";
import {ScoreActivatorComponent} from "./activators/score/score.activator";
import { ListenerComponent } from './activators/listener/listener.component';

@NgModule({
  declarations: [
    GameComponent,
    PlatformsActivatorComponent,
    BallActivatorComponent,
    GameStartActivatorComponent,
    ScoreActivatorComponent,
    ListenerComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
  ]
})
export class GameModule { }
