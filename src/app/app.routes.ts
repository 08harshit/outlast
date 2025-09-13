import { Routes } from '@angular/router';
import { GameBoardComponent } from './components/game-board/game-board';

export const routes: Routes = [
  { path: '', component: GameBoardComponent },
  { path: 'game', component: GameBoardComponent },
  { path: '**', redirectTo: '' }
];
