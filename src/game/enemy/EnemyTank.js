import {
    Depth,
    Direction,
    EnemyHealthColorMap,
    EnemyLevels, GameAnimations,
    GameEvents as GamepadEvents,
    GameEvents, ParticipantType
} from '../Constants.js';

export default class EnemyTank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tankLevel = EnemyLevels.ONE) {
        super(scene, x, y, 'spritesheet_16x16', tankLevel.frame);
        this.scene = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.events.on(GameEvents.GRENADE_ENEMIES, () => {
            this.kill();
        })

        this.setPushable(false);
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.setDepth(Depth.TANK);
        this.initType(tankLevel)

        this.isFrozen = false;

        this.moveTimer = 0;

        this.nextShotTime = 0;
        this.bulletSpeed = tankLevel.bulletSpeed;


        this.changeDirection();

    }

    initType(tankLevel) {
        this.tankLevel = tankLevel;
        this.maxHealth = Phaser.Math.Between(tankLevel.hpRange[0], tankLevel.hpRange[1]); // Запоминаем максимум для расчета цвета
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
            tint: 0xFF4500, // Мигаем красным
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }

    update(time) {
        this.move(time);

        if (time > this.nextShotTime && !this.isFrozen) {
            this.fireSmart();
            this.nextShotTime = time + Phaser.Math.Between(1000, 3000);
        }

    }

    resetTank() {
        this.setVelocity(0, 0);
        this.changeDirection();
    }

    // MOVEMENT LOGIC
    move(time) {
        if (this.body.blocked.none === false || time > this.moveTimer) {
            if (!this.isFrozen) this.changeDirection();
            this.moveTimer = time + Phaser.Math.Between(2000, 4000);
        }
    }

    changeDirection() {
        const {level, speed} = this.tankLevel;

        const direction = this.findDirection();

        this.setVelocity(0, 0);
        if (direction === Direction.UP) {
            this.setVelocityY(-speed);
            this.play(`moveEnemy-${level}-up`, true);
        } else if (direction === Direction.DOWN) {
            this.setVelocityY(speed);
            this.play(`moveEnemy-${level}-down`, true);
        } else if (direction === Direction.LEFT) {
            this.setVelocityX(-speed);
            this.play(`moveEnemy-${level}-left`, true);
        } else if (direction === Direction.RIGHT) {
            this.setVelocityX(speed);
            this.play(`moveEnemy-${level}-right`, true);
        }
        this.direction = direction;

    }

    findDirection() {
        // Шанс 40%, что танк выберет путь именно к базе
        if (Phaser.Math.Between(0, 100) < 40) {
            const dx = this.scene.base.x - this.x;
            const dy = this.scene.base.y - this.y;

            // Если база ниже — выбираем DOWN, если правее — RIGHT и т.д.
            return Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? Direction.RIGHT : Direction.LEFT)
                : (dy > 0 ? Direction.DOWN : Direction.UP);
        } else {
            return this.getRandomDirection();
        }
    }

    getRandomDirection() {
        // const directionsSet = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
        const directionsSet = Object.values(Direction);
        return directionsSet[Phaser.Math.Between(0, 3)];
    }

    // MOVEMENT LOGIC END

    // FIRE LOGIC

    fireNow() {
        if (!this.canFire()) return;
        this.spawnBullet();
    }

    fireSmart() {
        if (!this.canFire()) return;

        const {player, base} = this.scene;
        const targets = [player, base];

        for (let target of targets) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;

            const isTargetAhead =
                (this.direction === Direction.UP && Math.abs(dx) < 8 && dy < 0) ||
                (this.direction === Direction.DOWN && Math.abs(dx) < 8 && dy > 0) ||
                (this.direction === Direction.LEFT && Math.abs(dy) < 8 && dx < 0) ||
                (this.direction === Direction.RIGHT && Math.abs(dy) < 8 && dx > 0);

            if (isTargetAhead) {
                this.spawnBullet();
                return;
            }
        }

        if (Phaser.Math.Between(0, 100) < 2) { // 2% шанс в каждом кадре (этого хватит)
            this.spawnBullet();
        }
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
        const {x, y, scene} = this;
        if (scene) {
            this.disableEnemy();
            const explosion = scene.add.sprite(x, y, 'spritesheet_16x16');
            explosion.play(GameAnimations.EXPLOSION);
            explosion.on(GameAnimations.ANIMATIONCOMPLETE, () => {
                explosion.destroy();
            });
            scene.events.emit(GameEvents.ENEMY_DIE);
        }
        this.destroy();
    }

    freeze() {
        this.isFrozen = true;
        this.setVelocity(0, 0);
        this.anims.pause();
    }

    unfreeze() {
        this.isFrozen = false;
        this.anims.resume();
        this.changeDirection();
    }

    findActiveBullets() {
        const {bulletsManager} = this.scene;
        return bulletsManager.group.getChildren().filter(b => b.active && b.shooter === this)
    }

    disableEnemy() {
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
    }
}