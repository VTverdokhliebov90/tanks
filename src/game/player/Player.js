import Phaser from 'phaser';
import {
    Atlas16, Depth,
    Direction,
    GameAnimations,
    GameConfig,
    GameEvents,
    ParticipantType,
    PlayerLevels, PlayersConfig
} from "../Constants";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, playerIndex, tankLevel = PlayerLevels[0]) {
        const {index, spawnPoint} = PlayersConfig.players[playerIndex];
        super(scene, spawnPoint.x, spawnPoint.y, Atlas16, tankLevel.frame[playerIndex]);

        //STATIC DATA
        this.setDepth(Depth.TANK);
        this.index = index;
        this.spawnPoint = spawnPoint;
        this.gridSize = 8;
        this.fireDelay = 250;

        //DYNAMIC DATA
        this.movementDirection = Direction.NONE;
        this.orientation = Direction.UP;
        this.playerTries = GameConfig.INITIAL_PLAYER_TRIES;
        this.playerLevel = tankLevel.level;
        this.isShielded = false;
        this.lastFireTime = 0;

        // KEYBOARD CONTROLS
        if (this.index === 0) {
            this.moveUpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.moveDownKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.moveLeftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.moveRightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        } else {
            this.moveUpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
            this.moveDownKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
            this.moveLeftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
            this.moveRightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
            this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        }

        // INITIALIZATION
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setPushable(false);

        this.initShieldSprite();

        this.applyPlayerLevelSettings();
        this.disablePlayer();

        // this.scene.input.gamepad.gamepads.forEach((pad, index) => {
        //     console.log(`Pad index ${index}: ${pad.id}`);
        // });

    }

    preDestroy() {
        if (this.shieldSprite) this.shieldSprite.destroy();
        if (this.shieldTimer) this.shieldTimer.remove();
        super.preDestroy();
    }

    initShieldSprite() {
        this.shieldSprite = this.scene.add.sprite(this.x, this.y, Atlas16);
        this.shieldSprite.setBlendMode(Phaser.BlendModes.SCREEN);
        this.shieldSprite.setVisible(this.isShielded);
        this.shieldSprite.setDepth(this.depth + 1);
        this.shieldSprite.play(GameAnimations.SHIELD_LOOP);
    }

    update() {
        this.handlePlayerInputs();
        // this.testPad();
        this.handleMovement();
        this.handleAttack();
        this.handleShieldVisual();

        if (this.movementDirection !== Direction.NONE) {
            this.orientation = this.movementDirection;
        }
    }

    testPad() {

        const pad = this.scene.input.gamepad.getPad(1);
        if (pad) {
            pad.buttons.forEach((b, i) => { if(b.pressed) console.log('Button:', i) });
            pad.axes.forEach((a, i) => { if(Math.abs(a) > 0.5) console.log('Axis:', i, 'Value:', a) });
        }
        if (pad) {
            // 1. Проверяем все кнопки. Если увидишь индекс с pressed: true — это твоя кнопка.
            // pad.buttons.forEach((btn, index) => {
            //     if (btn.pressed) console.log(`Нажата кнопка №${index}`);
            // });

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
            this.movementDirection = Direction.UP;
        } else if (this.moveRightKey.isDown) {
            this.movementDirection = Direction.RIGHT;
        } else if (this.moveLeftKey.isDown) {
            this.movementDirection = Direction.LEFT;
        } else if (this.moveDownKey.isDown) {
            this.movementDirection = Direction.DOWN;
        } else {
            this.movementDirection = Direction.NONE;
        }
    }

    handlePadInputs() {
        const pad = this.scene.input.gamepad ? this.scene.input.gamepad.getPad(this.index) : null;
        // console.log("Connected pads:", this.scene.input.gamepad.total);
        // if (this.index === 1) console.log(pad)
        if (!pad || !pad.axes) return;

        const hatValue = pad.axes[9] ? pad.axes[9].value : 0;

        if (this.moveUpKey.isDown || hatValue < -0.9) {
            this.movementDirection = Direction.UP;    // значение: -1
        } else if (this.moveRightKey.isDown || hatValue > -0.5 && hatValue < -0.3) {
            this.movementDirection = Direction.RIGHT; // значение: -0.4
        } else if (this.moveLeftKey.isDown || hatValue > 0.6 && hatValue < 0.8) {
            this.movementDirection = Direction.LEFT;  // значение: 0.7
        } else if (this.moveDownKey.isDown || hatValue > 0.05 && hatValue < 0.25) {
            this.movementDirection = Direction.DOWN;  // значение: 0.14 (примерно)
        } else {
            this.movementDirection = Direction.NONE;
        }

        if (this.movementDirection !== Direction.NONE) {
            // console.log("Current Direction:", this.currentDirection);
        }
    }

    applyPlayerLevelSettings() {
        const settings = PlayerLevels[this.playerLevel];
        this.speed = settings.speed;
        this.bulletSpeed = settings.bulletSpeed;
        this.maxBullets = settings.maxBullets;
        this.canBreakSteel = settings.canBreakSteel;
        // this.setFrame(settings.frame);
        this.play(`move-${this.playerLevel}-${this.orientation}`, true);
        this.anims.stop();
    }

    spawnPlayer(resetLevel = true) {
        if (!this.scene || !this.scene.add) return;

        this.disablePlayer();
        const {scene, spawnPoint} = this;

        const spawnStar = scene.add.sprite(spawnPoint.x, spawnPoint.y, Atlas16);
        spawnStar.setBlendMode(Phaser.BlendModes.SCREEN);
        spawnStar.play(GameAnimations.SPAWN_STAR);
        spawnStar.on(GameAnimations.ANIMATIONCOMPLETE, () => {
            if (resetLevel) this.playerLevel = 0;
            this.movementDirection = Direction.UP;
            this.orientation = Direction.UP;
            this.applyPlayerLevelSettings();

            this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
            this.setVelocity(0, 0);
            this.setActive(true);
            this.setVisible(true);
            this.anims.stop();
            scene.physics.world.enable(this);

            this.enableShield(GameConfig.PLAYER_SPAWN_SHIELD_DURATION);

            spawnStar.destroy();
        });
    }

    disablePlayer() {
        this.setActive(false);
        this.setVisible(false);
        this.scene.physics.world.disable(this);
        this.anims.stop();
    }

    // MOVEMENT
    handleMovement() {
        const { index, playerLevel, speed } = this;
        const prevVelocityX = this.body.velocity.x;
        const prevVelocityY = this.body.velocity.y;

        switch (this.movementDirection) {
            case Direction.UP:
                if (prevVelocityY === 0) this.x = Math.round(this.x / this.gridSize) * this.gridSize;
                this.setVelocity(0, -speed);
                this.play(`move-${index}-${playerLevel}-${Direction.UP}`, true);
                break;
            case Direction.DOWN:
                if (prevVelocityY === 0) this.x = Math.round(this.x / this.gridSize) * this.gridSize;
                this.setVelocity(0, speed);
                this.play(`move-${index}-${playerLevel}-${Direction.DOWN}`, true);
                break;
            case Direction.LEFT:
                if (prevVelocityX === 0) this.y = Math.round(this.y / this.gridSize) * this.gridSize;
                this.setVelocity(-speed, 0);
                this.play(`move-${index}-${playerLevel}-${Direction.LEFT}`, true);
                break;
            case Direction.RIGHT:
                if (prevVelocityX === 0) this.y = Math.round(this.y / this.gridSize) * this.gridSize;
                this.setVelocity(speed, 0);
                this.play(`move-${index}-${playerLevel}-${Direction.RIGHT}`, true);
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
        const pad = this.scene.input.gamepad ? this.scene.input.gamepad.getPad(this.index) : null;
        const currentTime = this.scene.time.now;
        const isFirePressed = this.attackKey.isDown || (pad && pad.buttons[2]?.pressed);

        if (isFirePressed) {
            if (currentTime > this.lastFireTime + this.fireDelay) {
                const activeBullets = this.findActiveBullets().length;

                if (activeBullets < this.maxBullets) {
                    this.fireBullet();
                    this.lastFireTime = currentTime; // Запоминаем время выстрела
                }
            }
        }

        // if (this.attackKey.isDown || (pad && pad.buttons[1]?.pressed)) {
        //     const activeBullets = this.findActiveBullets().length;
        //     if (activeBullets < this.maxBullets) {
        //         this.fireBullet();
        //     }
        // }
    }

    findActiveBullets() {
        const {bulletsManager} = this.scene;
        return bulletsManager.group.getChildren().filter(b => b.active && b.ownerType === `${ParticipantType.PLAYER}-${this.index}`)
    }

    fireBullet() {
        if (!this || !this.active) return;
        this.scene.bulletsManager.add(this, `${ParticipantType.PLAYER}-${this.index}`, this.bulletSpeed, this.canBreakSteel);
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
        if (this.playerLevel < 3) {
            this.playerLevel++;
            this.applyPlayerLevelSettings();
        }
    }

    upMaxLevel() {
        this.playerLevel = 3;
        this.applyPlayerLevelSettings();
    }

    addTry() {
        this.playerTries++;
        this.scene.events.emit(GameEvents.PLAYER_ADD_TRY);
    }

    // BONUS LOGIC END

    // DAMAGE LOGIC
    takeDamage() {
        if (!this.isShielded) {
            if (this.playerLevel > 2) {
                this.playerLevel--;
                this.applyPlayerLevelSettings();
            } else {
                this.handlePlayerDeath();
            }
        }
    }

    handlePlayerDeath() {
        const {x, y, scene, index} = this;

        this.playerTries--;
        this.disablePlayer();

        const explosion = scene.add.sprite(x, y, Atlas16);
        explosion.setBlendMode(Phaser.BlendModes.SCREEN);
        explosion.play(GameAnimations.EXPLOSION);
        explosion.on(GameAnimations.ANIMATIONCOMPLETE, () => {
            scene.events.emit(GameEvents.PLAYER_LOOSE_TRY, this);
            explosion.destroy()
        });
    }

    // DAMAGE LOGIC END
    enableShield(time = GameConfig.PLAYER_SHIELD_DURATION) {
        if (this.shieldTimer) this.shieldTimer.remove();
        this.isShielded = true;
        this.shieldTimer = this.scene.time.delayedCall(time, () => {
            this.disableShield();
        }, [], this);
    }

    disableShield() {
        this.isShielded = false;
    }


}