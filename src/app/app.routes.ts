import { Routes } from '@angular/router';
import { GameBoard } from './components/game-board/game-board';

export const routes: Routes = [
  { path: '', component: GameBoard },
  { path: 'game', component: GameBoard },
  { path: '**', redirectTo: '' }
];
