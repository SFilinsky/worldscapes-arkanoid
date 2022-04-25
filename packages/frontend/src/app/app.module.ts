import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from "@angular/common/http";
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import {IdentityService} from "./services/identity.service";
import {KeyboardService} from "./services/keyboard.service";
import {GameModule} from "./features/game/game.module";
import {MenuModule} from "./features/menu/menu.module";
import {AudioService} from "./services/audio.service";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    GameModule,
    MenuModule,
  ],
  providers: [
    IdentityService,
    KeyboardService,
    AudioService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
