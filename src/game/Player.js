import Phaser from 'phaser';
import {
    Direction, GameAnimations,
    GameAnimations as Animations,
    GameConfig,
    GameEvents,
    GameEvents as GamepadEvents, ParticipantType,
    PlayerLevels
} from "./Constants";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnPoint = GameConfig.PLAYER_1_SPAWN_POINT, tankLevel = PlayerLevels[0]) {
        super(scene, spawnPoint.x, spawnPoint.y, 'spritesheet_16x16', tankLevel.frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setPushable(false);

        this.spawnPoint = spawnPoint;

        this.isShielded = false;
        this.shieldSprite = scene.add.sprite(this.x, this.y, 'spritesheet_16x16');
        this.shieldSprite.setBlendMode(Phaser.BlendModes.SCREEN);
        this.shieldSprite.play('shield-loop');
        this.shieldSprite.setVisible(this.isShielded);
        this.shieldSprite.setDepth(this.depth + 1);
        this.currentDirection = Direction.UP;
        this.gridSize = 8;

        // KEYBOARD CONTROLS
        this.moveUpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.moveDownKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.moveLeftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.moveRightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.level = tankLevel.level;
        this.live = GameConfig.INITIAL_PLAYER_TRIES;
        this.applyLevelSettings();

        this.disablePlayer();

    }

    preDestroy() {
        if (this.shieldSprite) this.shieldSprite.destroy();
        if (this.shieldTimer) this.shieldTimer.remove();
        super.preDestroy();
    }

    update(...args) {
        this.handleMovement();
        this.handleAttack();
        this.handleShieldVisual();
    }

    spawn(resetLevel = true) {
        const {scene, spawnPoint} = this;

        this.disablePlayer();

        const spawnStar = scene.add.sprite(spawnPoint.x, spawnPoint.y, 'spritesheet_16x16');
        spawnStar.setBlendMode(Phaser.BlendModes.SCREEN);
        spawnStar.play(GameAnimations.SPAWN_STAR);
        spawnStar.on(GameAnimations.ANIMATIONCOMPLETE, () => {
            this.reset(spawnPoint, resetLevel);
            spawnStar.destroy();
        });
    }

    applyLevelSettings() {
        const settings = PlayerLevels[this.level];
        this.speed = settings.speed;
        this.bulletSpeed = settings.bulletSpeed;
        this.maxBullets = settings.maxBullets;
        this.canBreakSteel = settings.canBreakSteel;
        this.setFrame(settings.frame); // Меняем внешний вид
    }

    reset(spawnPoint, resetLevel = true) {
        this.setActive(true).setVisible(true);
        this.setPosition(spawnPoint.x, spawnPoint.y);
        this.body.enable = true;
        this.body.reset(spawnPoint.x, spawnPoint.y);
        this.setVelocity(0, 0);
        this.enableShield(GameConfig.PLAYER_SPAWN_SHIELD_DURATION); // Даем щит при появлении
        if (resetLevel) this.level = 0;
        this.applyLevelSettings();
        this.play(`move-${this.level}-${Direction.UP}`, true);
    }

    // MOVEMENT
    handleMovement() {
        const onIce = this.checkIfOnIce();
        const anyKey = this.moveUpKey.isDown
            || this.moveDownKey.isDown
            || this.moveLeftKey.isDown
            || this.moveRightKey.isDown;

        if (anyKey) {
            this.move();
        } else if (onIce) {
            // Скользим только если кнопки НЕ нажаты
            this.applyInertia();
        } else {
            this.body.setVelocity(0, 0); // Мгновенный стоп на земле
            this.anims.stop();
        }

    }

    applyInertia() {
        const friction = 0.95; // Сделай чуть меньше для резкости
        let vx = this.body.velocity.x;
        let vy = this.body.velocity.y;

        // Гасим скорость
        vx *= friction;
        vy *= friction;

        // Порог остановки
        if (Math.abs(vx) < 10) vx = 0;
        if (Math.abs(vy) < 10) vy = 0;

        this.body.setVelocity(vx, vy);

        // Если всё заглохло — стопаем анимацию
        if (vx === 0 && vy === 0) {
            this.anims.stop();
        }
    }

    move() {
        const level = this.level;
        const speed = this.speed;
        const prevVelocityX = this.body.velocity.x;
        const prevVelocityY = this.body.velocity.y;


        if (this.moveUpKey.isDown) {
            if (prevVelocityY === 0) this.x = Math.round(this.x / this.gridSize) * this.gridSize;
            this.setVelocity(0, -speed);
            this.lastDir = Direction.UP;
            this.play(`move-${level}-${Direction.UP}`, true);
        } else if (this.moveDownKey.isDown) {
            if (prevVelocityY === 0) this.x = Math.round(this.x / this.gridSize) * this.gridSize;
            this.setVelocity(0, speed);
            this.lastDir = Direction.DOWN;
            this.play(`move-${level}-${Direction.DOWN}`, true);
        } else if (this.moveLeftKey.isDown) {
            if (prevVelocityX === 0) this.y = Math.round(this.y / this.gridSize) * this.gridSize;
            this.setVelocity(-speed, 0);
            this.lastDir = Direction.LEFT;
            this.play(`move-${level}-${Direction.LEFT}`, true);
        } else if (this.moveRightKey.isDown) {
            if (prevVelocityX === 0) this.y = Math.round(this.y / this.gridSize) * this.gridSize;
            this.setVelocity(speed, 0);
            this.lastDir = Direction.RIGHT;
            this.play(`move-${level}-${Direction.RIGHT}`, true);
        } else {
            this.anims.stop();
        }
    }

    checkIfOnIce() {
        return this.scene.physics.overlap(this, this.scene.builderManager.decor.ice);
    }

    // MOVEMENT END

    // ATTACK
    handleAttack() {
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            const activeBullets = this.findActiveBullets().length;
            if (activeBullets < this.maxBullets) {
                this.fireBullet();
            }
        }
    }

    findActiveBullets() {
        const { bulletsManager } = this.scene;
        return bulletsManager.group.getChildren().filter(b => b.active && b.ownerType === ParticipantType.PLAYER)
    }

    fireBullet() {
        if (!this || !this.active) return;
        this.scene.bulletsManager.add(this, ParticipantType.PLAYER, this.bulletSpeed, this.canBreakSteel);
    }
    // ATTACK END

    // VISUALS
    handleShieldVisual() {
        if (!this.active || !this.isShielded) {
            this.shieldSprite.setVisible(false);
            return;
        }

        this.shieldSprite.copyPosition(this);
        this.shieldSprite.setVisible(true);
    }
    // VISUALS END

    // BONUS LOGIC
    upLevel() {
        if (this.level < 3) {
            this.level++;
            this.applyLevelSettings();
            console.log(`Уровень повышен до: ${this.level}`);
        }
    }

    upMaxLevel() {
        this.level = 3;
        this.applyLevelSettings();
        console.log(`Уровень повышен до: ${this.level}`);
    }

    addTry() {
        this.live++;
        this.scene.events.emit(GameEvents.PLAYER_ADD_TRY);
    }

    enableShield(time = GameConfig.PLAYER_SHIELD_DURATION) {
        if (this.shieldTimer) this.shieldTimer.remove();
        this.isShielded = true;
        this.shieldTimer = this.scene.time.delayedCall(time, () => {
            this.disableShield();
        }, [], this);
    }

    // BONUS LOGIC END

    // DAMAGE LOGIC
    takeDamage() {
        if (!this.isShielded) {
            if (this.level > 2) {
                this.level--;
                this.applyLevelSettings();
            } else {
                this.handlePlayerDeath();
            }
        }
    }

    handlePlayerDeath() {
        const {x, y, scene} = this;

        this.live--;

        const explosion = scene.add.sprite(x, y, 'spritesheet_16x16');
        explosion.setBlendMode(Phaser.BlendModes.SCREEN);

        explosion.play('explosion');
        explosion.on(Animations.ANIMATIONCOMPLETE, () => {
            this.disablePlayer();
            explosion.destroy()
        });

        if (this.live > 0) {
            scene.events.emit(GameEvents.PLAYER_LOOSE_TRY, this.live);
            scene.time.delayedCall(GameConfig.PLAYER_RESPAWN_DELAY, () => {
                this.spawn(true);
            });
        } else {
            scene.events.emit(GamepadEvents.GAME_OVER);
        }
    }
    // DAMAGE LOGIC END

    disableShield() {
        this.isShielded = false;
    }

    disablePlayer() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false; // Выключаем физику
    }
}