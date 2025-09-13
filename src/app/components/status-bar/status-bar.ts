import { Component } from '@angular/core';
import { ScoreBoard } from './score-board/score-board';
import { GameControls } from './game-controls/game-controls';

@Component({
  selector: 'app-status-bar',
  imports: [ScoreBoard, GameControls],
  templateUrl: './status-bar.html',
  styleUrl: './status-bar.scss'
})
export class StatusBar {

}
