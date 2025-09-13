import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import Phaser from 'phaser';
import * as _ from 'lodash';
import { PlayerState, ObstacleState } from '../../services/game-state.service';

@Component({
  selector: 'app-game-board',
  imports: [],
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss'
})
export class GameBoardComponent implements OnInit, OnDestroy {
  private static instanceCounter = 0;
  private instanceId: number = 0;
  // ...existing code...
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;
  
  private game!: Phaser.Game;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private bullets!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private lastFired = 0;
  private playerHealth = 100;
  private healthText!: Phaser.GameObjects.Text;
  constructor() {
  // ...existing code...
  }

  ngOnInit(): void {
    this.initializeGame();
    // ...existing code...
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
    }
    // ...existing code...
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

    // Create a small yellow bullet
    const bulletGraphics = this.game.scene.scenes[0].add.graphics();
    bulletGraphics.fillStyle(0xffff00);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // Create explosion effect texture
    const explosionGraphics = this.game.scene.scenes[0].add.graphics();
    explosionGraphics.fillStyle(0xff4500); // Orange-red color
    explosionGraphics.fillCircle(0, 0, 16);
    explosionGraphics.generateTexture('explosion', 32, 32);
    explosionGraphics.destroy();
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
    
    // Set player data for multiplayer preparation
    this.player.setData('health', this.playerHealth);
    this.player.setData('playerId', 'player1'); // For future multiplayer
    


    // Create bullets group
    this.bullets = scene.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // Create obstacles static group
    this.obstacles = scene.physics.add.staticGroup();

    // Create some obstacles scattered around the world
    this.createObstacles(scene, worldWidth, worldHeight);

    // Set up camera to follow the player
    scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    scene.cameras.main.startFollow(this.player);
    scene.cameras.main.setZoom(1);

    // Set up input controls
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,S,A,D');

    // Set up mouse input for shooting
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet(scene);
      }
    });

    // Add UI text that follows the camera
    this.healthText = scene.add.text(16, 16, 'WASD/Arrow Keys: Move\nMouse: Look direction\nLeft Click: Fire bullet\nHealth: ' + this.playerHealth, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // Keep UI text fixed on screen
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
    
    // Prepare obstacles data for game state
    const obstaclesData: Omit<ObstacleState, 'id'>[] = [];
    
    // Use Lodash forEach for cleaner iteration
    _.forEach(obstacleIndices, (index) => {
      // Use Lodash random for better random number generation
      const x = _.random(100, worldWidth - 100);
      const y = _.random(100, worldHeight - 100);
      
      // Create obstacle directly in static group
      this.obstacles.create(x, y, 'obstacle');
      
      // Add to obstacles data for game state
      obstaclesData.push({
        x: x,
        y: y,
        width: 64,
        height: 64
      });
    });
    
 
    // Add collision between player and obstacles group
    scene.physics.add.collider(this.player, this.obstacles);
    
    // Add collision between bullets and obstacles group
    scene.physics.add.collider(this.bullets, this.obstacles, (bullet: Phaser.Physics.Arcade.Sprite, obstacle: Phaser.Physics.Arcade.Sprite) => {
      // Create explosion effect at bullet position
      this.createExplosionEffect(scene, bullet.x, bullet.y);
      
      // Remove bullet from game state
      const bulletId = bullet.getData('bulletId') || `bullet_${bullet.x}_${bullet.y}`;
      
      
      // Destroy the bullet
      bullet.destroy();
      
      // Static obstacles cannot move - no need for extra safety measures
    });
    
    // Add collision between bullets and player (for multiplayer preparation)
    scene.physics.add.collider(this.bullets, this.player, (bullet: Phaser.Physics.Arcade.Sprite, player: Phaser.Physics.Arcade.Sprite) => {
      this.handlePlayerHit(scene, bullet, player);
    });
    
    // Log obstacle count using Lodash
  // ...existing code...
  }

  private fireBullet(scene: any): void {
    const time = scene.time.now;
    
    // Rate limiting - can only fire every 200ms
    if (time - this.lastFired < 200) {
      return;
    }
    
    this.lastFired = time;
    
    // Get bullet from pool or create new one
    const bullet = this.bullets.get();
    
    if (bullet) {
      // Position bullet at player center
      bullet.setPosition(this.player.x, this.player.y);
      
      // Get mouse position
      const mouseX = scene.input.activePointer.worldX;
      const mouseY = scene.input.activePointer.worldY;
      
      // Calculate direction to mouse
      const angle = Phaser.Math.Angle.Between(
        this.player.x, 
        this.player.y, 
        mouseX, 
        mouseY
      );
      
      // Set bullet rotation and velocity
      bullet.setRotation(angle);
      const bulletSpeed = 400;
      const velocityX = Math.cos(angle) * bulletSpeed;
      const velocityY = Math.sin(angle) * bulletSpeed;
      bullet.setVelocity(velocityX, velocityY);
      
      // Set bullet owner for multiplayer preparation
      bullet.setData('ownerId', this.player.getData('playerId'));
      

      // Set bullet to be destroyed after 3 seconds with explosion effect
      scene.time.delayedCall(3000, () => {
        if (bullet.active) {
          this.createExplosionEffect(scene, bullet.x, bullet.y);
          bullet.destroy();
        }
      });
    }
  }

  private createExplosionEffect(scene: any, x: number, y: number): void {
    // Create explosion sprite
    const explosion = scene.add.sprite(x, y, 'explosion');
    explosion.setScale(0.5);
    explosion.setAlpha(0.8);
    
    // Animate explosion
    scene.tweens.add({
      targets: explosion,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      }
    });
    
    // Create particle effect using graphics
    const particles = scene.add.graphics();
    particles.setPosition(x, y);
    
    // Create multiple small particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = _.random(20, 40);
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;
      
      // Create particle
      const particle = scene.add.graphics();
      particle.fillStyle(_.sample([0xff4500, 0xff6347, 0xffa500, 0xffff00])); // Random colors
      particle.fillCircle(0, 0, _.random(2, 4));
      particle.setPosition(x + particleX, y + particleY);
      
      // Animate particle
      scene.tweens.add({
        targets: particle,
        x: x + particleX * 2,
        y: y + particleY * 2,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: _.random(200, 400),
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
    
    // Destroy particles container after animation
    scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  private handlePlayerHit(scene: any, bullet: Phaser.Physics.Arcade.Sprite, player: Phaser.Physics.Arcade.Sprite): void {
    // Don't hit yourself (for future multiplayer)
    if (bullet.getData('ownerId') === player.getData('playerId')) {
      return;
    }

    // Create hit effect
    this.createExplosionEffect(scene, bullet.x, bullet.y);
    
    // Reduce player health
    const currentHealth = player.getData('health');
    const newHealth = Math.max(0, currentHealth - 25); // 25 damage per hit
    player.setData('health', newHealth);
    this.playerHealth = newHealth;
    
    // Update health display
    this.updateHealthDisplay(scene);
    
    // Flash player red when hit
    scene.tweens.add({
      targets: player,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        player.clearTint();
      }
    });
    
    // Destroy bullet
    bullet.destroy();
  }

  private updateHealthDisplay(scene: any): void {
    if (this.healthText) {
      this.healthText.setText('WASD/Arrow Keys: Move\nMouse: Look direction\nLeft Click: Fire bullet\nHealth: ' + this.playerHealth);
    }
  }

  private updatePlayerState(): void {
    const playerState: PlayerState = {
      id: this.player.getData('playerId'),
      x: this.player.x,
      y: this.player.y,
      rotation: this.player.rotation,
      health: this.playerHealth,
      isAlive: this.playerHealth > 0,
      velocityX: this.player.body?.velocity.x || 0,
      velocityY: this.player.body?.velocity.y || 0
    };
    
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
    
    // Update player state in game state service
    this.updatePlayerState();
  }
}