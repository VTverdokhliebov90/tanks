import Phaser from 'phaser';
import {Atlas16, Depth, Direction, GameAnimations, GameConfig} from "../Constants";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction, ownerType, speed = GameConfig.BULLET_SPEED, canBreakSteel, shooter) {
        super(scene, x, y, Atlas16, `bullet_frame_${direction}`);
        this.setBlendMode(Phaser.BlendModes.SCREEN);

        this.setDepth(Depth.TANK);
        this.ownerType = ownerType;
        this.direction = direction;
        this.speed = speed;
        this.canBreakSteel = canBreakSteel;
        this.shooter = shooter;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.bulletsManager.group.add(this);

        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.setVelocityByDirection();
    }

    setVelocityByDirection() {
        if (!this.body) return;

        this.body.setAllowGravity(false);

        switch (this.direction) {
            case Direction.UP:
                this.setVelocityY(-this.speed);
                break;
            case Direction.DOWN:
                this.setVelocityY(this.speed);
                break;
            case Direction.LEFT:
                this.setVelocityX(-this.speed);
                break;
            case Direction.RIGHT:
                this.setVelocityX(this.speed);
                break;
        }
    }

    killBullet() {
        if (this.isDestroying || !this.scene) return;
        this.isDestroying = true;

        if (this.shooter && typeof this.shooter.onBulletDestroyed === 'function') {
            this.shooter.onBulletDestroyed();
        }

        const {x, y} = this;

        const explosion = this.scene.add.sprite(x, y, Atlas16);
        explosion.setDepth(Depth.TANK + 1);
        explosion.play(GameAnimations.EXPLOSION);
        explosion.once(GameAnimations.ANIMATIONCOMPLETE, () => explosion.destroy());

        this.destroy();
    }
}