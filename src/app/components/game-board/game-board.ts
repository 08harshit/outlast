import { Component } from '@angular/core';
import { Player } from '../player/player';
import { Gun } from '../gun/gun';
import { Obstacle } from '../obstacle/obstacle';
import { Bullet } from '../bullet/bullet';
import { StatusBar } from '../status-bar/status-bar';

@Component({
  selector: 'app-game-board',
  imports: [
    Player,
    Gun,
    Obstacle,
    Bullet,
    StatusBar
  ],
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss'
})
export class GameBoard {

}
