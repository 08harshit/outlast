import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import Phaser from 'phaser';
import * as _ from 'lodash';

@Component({
  selector: 'app-game-board',
  imports: [],
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss'
})
export class GameBoardComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;
  
  private game!: Phaser.Game;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  ngOnInit(): void {
    this.initializeGame();
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
    }
  }

  private initializeGame(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this)
      }
    };

    this.game = new Phaser.Game(config);
  }

  private preload(): void {
    // Create a 32x32 blue square for the player with red border on front
    const graphics = this.game.scene.scenes[0].add.graphics();
    
    // Fill blue square
    graphics.fillStyle(0x0066ff);
    graphics.fillRect(0, 0, 32, 32);
    
    // Add red border on the right side (front face)
    graphics.fillStyle(0xff0000);
    graphics.fillRect(28, 0, 4, 32); // Red border on right edge
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // Create a 64x64 green square for obstacles
    const obstacleGraphics = this.game.scene.scenes[0].add.graphics();
    obstacleGraphics.fillStyle(0x00ff00);
    obstacleGraphics.fillRect(0, 0, 64, 64);
    obstacleGraphics.generateTexture('obstacle', 64, 64);
    obstacleGraphics.destroy();
  }

  private create(): void {
    const scene = this.game.scene.scenes[0];
    
    // Create a large world (5x screen size)
    const worldWidth = this.game.scale.width * 5;
    const worldHeight = this.game.scale.height * 5;
    
    // Set world bounds
    scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    
    // Set background color to light green
    scene.cameras.main.setBackgroundColor('#90EE90');
    
    // Create grid pattern
    this.createGridPattern(scene, worldWidth, worldHeight);
    
    // Add player sprite to the center of the world
    this.player = scene.physics.add.sprite(worldWidth / 2, worldHeight / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // Create some obstacles scattered around the world
    this.createObstacles(scene, worldWidth, worldHeight);

    // Set up camera to follow the player
    scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    scene.cameras.main.startFollow(this.player);
    scene.cameras.main.setZoom(1);

    // Set up input controls
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,S,A,D');

    // Add UI text that follows the camera
    const uiText = scene.add.text(16, 16, 'WASD/Arrow Keys: Move\nMouse: Look direction\nGTA Vice City style controls!', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    uiText.setScrollFactor(0); // Keep UI text fixed on screen
  }

  private createGridPattern(scene: any, worldWidth: number, worldHeight: number): void {
    const gridSize = 50; // Grid cell size
    const gridGraphics = scene.add.graphics();
    
    // Set grid line style (translucent white)
    gridGraphics.lineStyle(1, 0xffffff, 0.3);
    
    // Draw vertical lines
    for (let x = 0; x <= worldWidth; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, worldHeight);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= worldHeight; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(worldWidth, y);
    }
    
    gridGraphics.strokePath();
  }

  private createObstacles(scene: any, worldWidth: number, worldHeight: number): void {
    // Create random obstacles across the world using Lodash
    const obstacleCount = 50;
    
    // Use Lodash range to create array of obstacle indices
    const obstacleIndices = _.range(obstacleCount);
    
    // Use Lodash forEach for cleaner iteration
    _.forEach(obstacleIndices, (index) => {
      // Use Lodash random for better random number generation
      const x = _.random(100, worldWidth - 100);
      const y = _.random(100, worldHeight - 100);
      
      const obstacle = scene.physics.add.sprite(x, y, 'obstacle');
      obstacle.setImmovable(true);
      
      // Add collision between player and obstacles
      scene.physics.add.collider(this.player, obstacle);
    });
    
    // Log obstacle count using Lodash
    console.log(`Created ${_.size(obstacleIndices)} obstacles using Lodash!`);
  }

  private update(): void {
    const speed = 200;
    const scene = this.game.scene.scenes[0];
    
    // Get mouse position in world coordinates
    const mouseX = scene.input.activePointer.worldX;
    const mouseY = scene.input.activePointer.worldY;
    
    // Calculate angle to mouse for rotation
    const angleToMouse = Phaser.Math.Angle.Between(
      this.player.x, 
      this.player.y, 
      mouseX, 
      mouseY
    );
    
    // Set player rotation to always face mouse cursor
    this.player.setRotation(angleToMouse);
    
    // Reset velocity
    this.player.setVelocity(0);
    
    // Handle movement with WASD/Arrow keys (GTA style) using Lodash
    const movementKeys = {
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown
    };
    
    // Use Lodash to calculate velocity
    const velocityX = _.sum([
      movementKeys.left ? -speed : 0,
      movementKeys.right ? speed : 0
    ]);
    
    const velocityY = _.sum([
      movementKeys.up ? -speed : 0,
      movementKeys.down ? speed : 0
    ]);
    
    // Apply velocity
    this.player.setVelocity(velocityX, velocityY);
    
    // Use Lodash to check if player is moving
    const isMoving = _.some(movementKeys);
    if (isMoving) {
      // Optional: Add movement effects here
      this.player.setAlpha(1.0);
    } else {
      // Optional: Idle state
      this.player.setAlpha(0.8);
    }
  }
}