import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MenuComponent} from "./features/menu/menu.component";
import {GameComponent} from "./features/game/game.component";

const routes: Routes = [
  { path: 'game', component: GameComponent },
  { path: '**', component: MenuComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
