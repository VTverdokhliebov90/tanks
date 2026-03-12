import {
    Atlas16,
    Depth,
    Direction, EnemyConfig,
    EnemyHealthColorMap,
    EnemyLevels, GameAnimations,
    GameEvents as GamepadEvents,
    GameEvents, ParticipantType
} from '../Constants.js';
import Phaser from "phaser";

export default class EnemyTank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tankLevel = EnemyLevels[0]) {
        super(scene, x, y, Atlas16, tankLevel.frame);
        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // STATIC
        this.bulletSpeed = tankLevel.bulletSpeed;
        this.movementDirection = Direction.DOWN;
        this.orientation = Direction.DOWN;
        this.fireDelay = EnemyConfig.FIRE_DELAY;
        this.maxBullets = 1;
        // DYNAMIC
        this.moveTimer = 0;
        this.isFrozen = false;
        this.lastFireTime = 0;
        this.currentBulletsCount = 0;

        // INITIALISATION
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.setBlendMode(Phaser.BlendModes.SCREEN);
        this.setDepth(Depth.TANK);
        this.setPushable(false);
        this.initLevel(tankLevel)
        this.initListeners();

        this.move();

    }

    initListeners() {
        this.scene.events.on(GameEvents.GRENADE_ENEMIES, this.kill, this);
        this.attackTimer = this.scene.time.addEvent({
            delay: 200,
            callback: this.handleAttack,
            callbackScope: this,
            loop: true
        });
        this.once('destroy', () => {
            // Отписываемся от глобального события сцены
            this.scene.events.off(GameEvents.GRENADE_ENEMIES, this.kill, this);

            // Останавливаем и удаляем таймер
            if (this.attackTimer) {
                this.attackTimer.destroy();
            }
        });
    }

    initLevel(tankLevel) {
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
        const possible = directionsSet.filter(d => d !== this.movementDirection);
        return Phaser.Utils.Array.GetRandom(possible);
    }

    // MOVEMENT LOGIC END

    // FIRE LOGIC

    handleAttack() {
        if (!this.scene || !this.active) return;

        const {playerManager, base} = this.scene;
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
            }
        }

        // if (Phaser.Math.Between(0, 100) < 2) { // 2% шанс в каждом кадре (этого хватит)
        //     this.fire();
        // }
    }

    fire() {
        const currentTime = this.scene.time.now;
        if (currentTime > this.lastFireTime + this.fireDelay && !this.isFrozen) {
            if (this.currentBulletsCount < this.maxBullets) {
                this.spawnBullet();
                this.lastFireTime = currentTime;
            }
        }
    }

    spawnBullet() {
        const { bulletsManager } = this.scene;
        const bullet = bulletsManager.add(this, ParticipantType.ENEMY);
        if (bullet) {
            this.currentBulletsCount++;
            bullet.shooter = this;
        }
        return bullet;
    }

    onBulletDestroyed() {
        this.currentBulletsCount = Math.max(0, this.currentBulletsCount - 1);
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
        if (!this.active) return;

        const {x, y} = this;
        this.setActive(false);
        this.setVisible(false);
        if (this.body) this.body.enable = false;

        const explosion = this.scene.add.sprite(x, y, Atlas16);
        explosion.play(GameAnimations.EXPLOSION);
        explosion.on(GameAnimations.ANIMATIONCOMPLETE, () => {
            explosion.destroy();
        });
        this.scene.events.emit(GameEvents.ENEMY_DIE, this);
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
}