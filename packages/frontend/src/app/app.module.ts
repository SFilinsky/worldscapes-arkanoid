import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import {PlatformsActivatorComponent} from "./features/game/platforms/platforms.activator";
import {IdentityService} from "./services/identity.service";

@NgModule({
  declarations: [
    AppComponent,
    PlatformsActivatorComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule
  ],
  providers: [
    IdentityService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
