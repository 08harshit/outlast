import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  rotation: number;
  health: number;
  isAlive: boolean;
  velocityX: number;
  velocityY: number;
}

export interface BulletState {
  id: string;
  x: number;
  y: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  ownerId: string;
  timestamp: number;
}

export interface ObstacleState {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameState {
  timestamp: number;
  players: PlayerState[];
  bullets: BulletState[];
  obstacles: ObstacleState[];
  worldWidth: number;
  worldHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private gameStateSubject = new BehaviorSubject<GameState>({
    timestamp: Date.now(),
    players: [],
    bullets: [],
    obstacles: [],
    worldWidth: 0,
    worldHeight: 0
  });

  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  private bulletCounter = 0;
  private obstacleCounter = 0;

  constructor() {
    console.log('GameStateService initialized - ready for multiplayer!');
  }

  /**
   * Update the complete game state
   */
  updateGameState(state: Partial<GameState>): void {
    const currentState = this.gameStateSubject.value;
    const newState: GameState = {
      ...currentState,
      ...state,
      timestamp: Date.now()
    };
    
    this.gameStateSubject.next(newState);
    this.logGameState(newState);
  }

  /**
   * Add or update a player state
   */
  updatePlayer(player: PlayerState): void {
    const currentState = this.gameStateSubject.value;
    const existingPlayerIndex = currentState.players.findIndex(p => p.id === player.id);
    
    if (existingPlayerIndex >= 0) {
      currentState.players[existingPlayerIndex] = player;
    } else {
      currentState.players.push(player);
    }
    
    this.updateGameState({ players: currentState.players });
  }

  /**
   * Add a new bullet to the game state
   */
  addBullet(bullet: Omit<BulletState, 'id' | 'timestamp'>): void {
    const currentState = this.gameStateSubject.value;
    const newBullet: BulletState = {
      ...bullet,
      id: `bullet_${++this.bulletCounter}`,
      timestamp: Date.now()
    };
    
    currentState.bullets.push(newBullet);
    this.updateGameState({ bullets: currentState.bullets });
  }

  /**
   * Remove a bullet from the game state
   */
  removeBullet(bulletId: string): void {
    const currentState = this.gameStateSubject.value;
    currentState.bullets = currentState.bullets.filter(b => b.id !== bulletId);
    this.updateGameState({ bullets: currentState.bullets });
  }

  /**
   * Initialize obstacles in the game state
   */
  initializeObstacles(obstacles: Omit<ObstacleState, 'id'>[]): void {
    const obstacleStates: ObstacleState[] = obstacles.map(obstacle => ({
      ...obstacle,
      id: `obstacle_${++this.obstacleCounter}`
    }));
    
    this.updateGameState({ obstacles: obstacleStates });
  }

  /**
   * Set world dimensions
   */
  setWorldDimensions(width: number, height: number): void {
    this.updateGameState({ worldWidth: width, worldHeight: height });
  }

  /**
   * Get current game state
   */
  getCurrentGameState(): GameState {
    return this.gameStateSubject.value;
  }

  /**
   * Log the current game state (for debugging and future server emission)
   */
  private logGameState(state: GameState): void {
    console.log('🎮 Game State Update:', {
      timestamp: new Date(state.timestamp).toISOString(),
      playerCount: state.players.length,
      bulletCount: state.bullets.length,
      obstacleCount: state.obstacles.length,
      worldSize: `${state.worldWidth}x${state.worldHeight}`,
      players: state.players.map(p => ({
        id: p.id,
        position: `(${Math.round(p.x)}, ${Math.round(p.y)})`,
        health: p.health,
        alive: p.isAlive
      })),
      bullets: state.bullets.map(b => ({
        id: b.id,
        owner: b.ownerId,
        position: `(${Math.round(b.x)}, ${Math.round(b.y)})`
      }))
    });
  }

  /**
   * Prepare game state for server emission (ready for multiplayer)
   */
  prepareForServerEmission(): GameState {
    const state = this.getCurrentGameState();
    
    // Add any server-specific data here
    const serverState: GameState = {
      ...state,
      timestamp: Date.now()
    };
    
    console.log('📡 Ready to emit to server:', serverState);
    return serverState;
  }

  /**
   * Simulate server emission (for testing)
   */
  simulateServerEmission(): void {
    const state = this.prepareForServerEmission();
    
    // Simulate network delay
    setTimeout(() => {
      console.log('🌐 Simulated server emission completed');
      // In real implementation, this would be an HTTP request or WebSocket
    }, 100);
  }
}
