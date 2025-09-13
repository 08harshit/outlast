import { Component } from '@angular/core';
import { PlayerAvatar } from './player-avatar/player-avatar';
import { PlayerStats } from './player-stats/player-stats';

@Component({
  selector: 'app-player',
  imports: [PlayerAvatar, PlayerStats],
  templateUrl: './player.html',
  styleUrl: './player.scss'
})
export class Player {

}
