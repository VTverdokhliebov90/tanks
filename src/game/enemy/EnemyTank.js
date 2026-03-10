import {
    Atlas16,
    Depth,
    Direction,
    EnemyHealthColorMap,
    EnemyLevels, GameAnimations,
    GameEvents as GamepadEvents,
    GameEvents, ParticipantType
} from '../Constants.js';

export default class EnemyTank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tankLevel = EnemyLevels.ONE) {
        super(scene, x, y, Atlas16, tankLevel.frame);
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.events.on(GameEvents.GRENADE_ENEMIES, () => {
            this.kill();
        })

        this.maxBullets = 1;

        this.setPushable(false);
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.setDepth(Depth.TANK);
        this.initType(tankLevel)

        this.isFrozen = false;

        this.moveTimer = 0;

        this.nextShotTime = 0;
        this.bulletSpeed = tankLevel.bulletSpeed;
        this.movementDirection = Direction.DOWN;
        this.orientation = Direction.DOWN;

        this.fireDelay = 2000;
        this.lastFireTime = 0;

        this.move();

    }

    initType(tankLevel) {
        this.tankLevel = tankLevel;
        this.maxHealth = Phaser.Math.Between(tankLevel.hpRange[0], tankLevel.hpRange[1]);
        this.health = this.maxHealth;
        this.isBonusTank = Phaser.Math.Between(1, 10) > 8;
        if (this.isBonusTank) {
            this.initBlinkingEffect();
        }
        this.updateVisualState();
    }

    initBlinkingEffect() {
        this.blinkingTween = this.scene.tweens.add({
            targets: this,
            tint: 0xFF4500,
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }

    update(time) {
        this.handleMovement(time);
        this.handleAttack();
    }

    // MOVEMENT LOGIC
    handleMovement(time) {
        if (this.body.blocked.none === false || time > this.moveTimer) {
            if (!this.isFrozen) {
                this.changeDirection();
                this.move();
            }
            this.moveTimer = time + Phaser.Math.Between(2000, 4000);
        }

        if (this.movementDirection !== Direction.NONE) {
            this.orientation = this.movementDirection;
        }
    }

    move() {
        const {level, speed} = this.tankLevel;

        this.setVelocity(0, 0);
        if (this.movementDirection === Direction.UP) {
            this.setVelocityY(-speed);
            this.play(`moveEnemy-${level}-up`, true);
        } else if (this.movementDirection === Direction.DOWN) {
            this.setVelocityY(speed);
            this.play(`moveEnemy-${level}-down`, true);
        } else if (this.movementDirection === Direction.LEFT) {
            this.setVelocityX(-speed);
            this.play(`moveEnemy-${level}-left`, true);
        } else if (this.movementDirection === Direction.RIGHT) {
            this.setVelocityX(speed);
            this.play(`moveEnemy-${level}-right`, true);
        }

    }

    changeDirection() {
        // Шанс 40%, что танк выберет путь именно к базе
        if (Phaser.Math.Between(0, 100) < 40) {
            const dx = this.scene.base.x - this.x;
            const dy = this.scene.base.y - this.y;

            // Если база ниже — выбираем DOWN, если правее — RIGHT и т.д.
            this.movementDirection = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? Direction.RIGHT : Direction.LEFT)
                : (dy > 0 ? Direction.DOWN : Direction.UP);
        } else {
            this.movementDirection = this.getRandomDirection();
        }
    }

    getRandomDirection() {
        const directionsSet = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        return directionsSet[Phaser.Math.Between(0, 3)];
    }

    // MOVEMENT LOGIC END

    // FIRE LOGIC

    handleAttack() {
        const { playerManager, base } = this.scene;
        // const player = Phaser.Utils.Array.GetRandom(playerManager.group.getChildren());
        const targets = [base, ...playerManager.group.getChildren()];

        for (let target of targets) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;

            const isTargetAhead =
                (this.orientation === Direction.UP && Math.abs(dx) < 8 && dy < 0) ||
                (this.orientation === Direction.DOWN && Math.abs(dx) < 8 && dy > 0) ||
                (this.orientation === Direction.LEFT && Math.abs(dy) < 8 && dx < 0) ||
                (this.orientation === Direction.RIGHT && Math.abs(dy) < 8 && dx > 0);

            if (isTargetAhead) {
                this.fire();
                // return;
            }
        }

        // if (Phaser.Math.Between(0, 100) < 2) { // 2% шанс в каждом кадре (этого хватит)
        //     this.fire();
        // }
    }

    fire() {
        const currentTime = this.scene.time.now;
        if (currentTime > this.lastFireTime + this.fireDelay && !this.isFrozen) {

            const activeBullets = this.findActiveBullets().length;
            if (activeBullets < this.maxBullets) {
                this.spawnBullet();
                this.lastFireTime = currentTime;
            }
        }

        // if (this.findActiveBullets().length < 1 && time > this.nextShotTime && !this.isFrozen) {
        //     this.fireSmart();
        //     this.nextShotTime = time + Phaser.Math.Between(1000, 1500);
        // }
        //
        // if (this.findActiveBullets().length < 1) {
        //     this.spawnBullet();
        // }
    }


    spawnBullet() {
        const {bulletsManager} = this.scene;
        const bullet = bulletsManager.add(this, ParticipantType.ENEMY);
        if (bullet) bullet.shooter = this;
    }

    canFire() {
        return this.findActiveBullets().length < 1;
    }

    // FIRE LOGIC END

    takeDamage() {
        if (this.isBonusTank) {
            this.isBonusTank = false; // Танк больше не бонусный

            // Останавливаем мигание (удаляем твин)
            if (this.blinkingTween) {
                this.blinkingTween.stop();
                this.clearTint(); // Возвращаем нормальный цвет
            }

            this.scene.events.emit(GamepadEvents.SPAWN_BONUS);
        }

        this.health--;

        if (this.health <= 0) {
            this.kill();
        } else {
            this.updateVisualState();
        }
    }

    updateVisualState() {
        if (this.health > 1) {
            this.setTint(EnemyHealthColorMap[this.health]);
        } else {
            this.clearTint();
        }
    }

    kill() {
        const {x, y} = this;
        if (this.scene) {
            this.setActive(false);
            this.setVisible(false);
            const explosion = this.scene.add.sprite(x, y, Atlas16);
            explosion.play(GameAnimations.EXPLOSION);
            explosion.on(GameAnimations.ANIMATIONCOMPLETE, () => {
                explosion.destroy();
            });
            this.scene.events.emit(GameEvents.ENEMY_DIE, this);
        }
    }

    freeze() {
        this.isFrozen = true;
        this.setVelocity(0, 0);
        this.anims.pause();
    }

    unfreeze() {
        this.isFrozen = false;
        this.anims.resume();
        this.move();
    }

    findActiveBullets() {
        const {bulletsManager} = this.scene;
        return bulletsManager.group.getChildren().filter(b => b.active && b.shooter === this)
    }
}