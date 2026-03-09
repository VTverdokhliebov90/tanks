import Phaser from 'phaser';
import {
    Atlas16,
    Direction, GameAnimations,
    GameAnimations as Animations,
    GameConfig,
    GameEvents,
    ParticipantType,
    PlayerLevels
} from "./Constants";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, spawnPoint = GameConfig.PLAYER_1_SPAWN_POINT, tankLevel = PlayerLevels[0]) {
        super(scene, spawnPoint.x, spawnPoint.y, Atlas16, tankLevel.frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setPushable(false);

        this.spawnPoint = spawnPoint;

        this.isShielded = false;
        this.shieldSprite = scene.add.sprite(this.x, this.y, Atlas16);
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
        this.handlePlayerInputs();
        // this.testPad();
        this.handleMovement();
        this.handleAttack();
        this.handleShieldVisual();
    }

    testPad() {
        const pad = this.scene.input.gamepad.getPad(0);
        if (pad) {
            // 1. Проверяем все кнопки. Если увидишь индекс с pressed: true — это твоя кнопка.
            pad.buttons.forEach((btn, index) => {
                if (btn.pressed) console.log(`Нажата кнопка №${index}`);
            });

            // 2. Проверяем все оси. Если при нажатии D-pad меняется число — это ось.
            // pad.axes.forEach((axis, index) => {
            //     if (
            //         index !== 0
            //         // && index !==1
            //         && index !== 2
            //         && index !== 3
            //         && index !== 4
            //         && index !== 5
            //         && index !== 6
            //         && index !== 7
            //         && index !== 8
            //         && index !== 9
            //         && (Math.abs(axis.value) > 0.2 || (Math.abs(axis.value) < -0.2))
            //     )
            //         console.log(`Ось №${index} изменилась: ${axis.value}`);
            // });
        }
    }

    handlePlayerInputs() {
        this.handleKeyboardInputs();
        this.handlePadInputs();
    }

    handleKeyboardInputs() {
        if (this.moveUpKey.isDown) {
            this.currentDirection = Direction.UP;
        } else if (this.moveRightKey.isDown) {
            this.currentDirection = Direction.RIGHT;
        } else if (this.moveLeftKey.isDown) {
            this.currentDirection = Direction.LEFT;
        } else if (this.moveDownKey.isDown) {
            this.currentDirection = Direction.DOWN;
        } else {
            this.currentDirection = Direction.NONE;
        }
    }

    handlePadInputs() {
        const pad = this.scene.input.gamepad ? this.scene.input.gamepad.getPad(0) : null;
        if (!pad || !pad.axes) return;

        const hatValue = pad.axes[9] ? pad.axes[9].value : 0;

        if (this.moveUpKey.isDown || hatValue < -0.9) {
            this.currentDirection = Direction.UP;    // значение: -1
        } else if (this.moveRightKey.isDown || hatValue > -0.5 && hatValue < -0.3) {
            this.currentDirection = Direction.RIGHT; // значение: -0.4
        } else if (this.moveLeftKey.isDown || hatValue > 0.6 && hatValue < 0.8) {
            this.currentDirection = Direction.LEFT;  // значение: 0.7
        } else if (this.moveDownKey.isDown || hatValue > 0.05 && hatValue < 0.25) {
            this.currentDirection = Direction.DOWN;  // значение: 0.14 (примерно)
        } else {
            this.currentDirection = Direction.NONE;
        }

        if (this.currentDirection !== Direction.NONE) {
            // console.log("Current Direction:", this.currentDirection);
        }
    }

    spawn(resetLevel = true) {
        const {scene, spawnPoint} = this;

        this.disablePlayer();

        const spawnStar = scene.add.sprite(spawnPoint.x, spawnPoint.y, Atlas16);
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
        const level = this.level;
        const speed = this.speed;
        const prevVelocityX = this.body.velocity.x;
        const prevVelocityY = this.body.velocity.y;

        switch (this.currentDirection) {
            case Direction.UP:
                if (prevVelocityY === 0) this.x = Math.round(this.x / this.gridSize) * this.gridSize;
                this.setVelocity(0, -speed);
                this.play(`move-${level}-${Direction.UP}`, true);
                break;
            case Direction.DOWN:
                if (prevVelocityY === 0) this.x = Math.round(this.x / this.gridSize) * this.gridSize;
                this.setVelocity(0, speed);
                this.play(`move-${level}-${Direction.DOWN}`, true);
                break;
            case Direction.LEFT:
                if (prevVelocityX === 0) this.y = Math.round(this.y / this.gridSize) * this.gridSize;
                this.setVelocity(-speed, 0);
                this.play(`move-${level}-${Direction.LEFT}`, true);
                break;
            case Direction.RIGHT:
                if (prevVelocityX === 0) this.y = Math.round(this.y / this.gridSize) * this.gridSize;
                this.setVelocity(speed, 0);
                this.play(`move-${level}-${Direction.RIGHT}`, true);
                break;
            default:
                if (this.checkIfOnIce()) {
                    this.applyInertia();
                } else {
                    this.setVelocity(0, 0);
                    this.anims.stop();
                }
        }
    }

    checkIfOnIce() {
        return this.scene.physics.overlap(this, this.scene.builderManager.decor.ice);
    }

    applyInertia() {
        const friction = 0.95;
        let vx = this.body.velocity.x;
        let vy = this.body.velocity.y;

        // Гасим скорость
        vx *= friction;
        vy *= friction;

        // Порог остановки
        if (Math.abs(vx) < 10) vx = 0;
        if (Math.abs(vy) < 10) vy = 0;

        this.body.setVelocity(vx, vy);

        if (vx === 0 && vy === 0) {
            this.anims.stop();
        }
    }

    // MOVEMENT END

    // ATTACK
    handleAttack() {
        const pad = this.scene.input.gamepad ? this.scene.input.gamepad.getPad(0) : null;

        if (this.attackKey.isDown || (pad && pad.buttons[1]?.pressed)) {
            const activeBullets = this.findActiveBullets().length;
            if (activeBullets < this.maxBullets) {
                this.fireBullet();
            }
        }
    }

    findActiveBullets() {
        const {bulletsManager} = this.scene;
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
        }
    }

    upMaxLevel() {
        this.level = 3;
        this.applyLevelSettings();
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

        const explosion = scene.add.sprite(x, y, Atlas16);
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
        this.body.enable = false;
    }
}