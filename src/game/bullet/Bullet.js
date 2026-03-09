import Phaser from 'phaser';
import {Atlas16, Depth, Direction, GameConfig} from "../Constants";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, direction, ownerType, speed = GameConfig.BULLET_SPEED, canBreakSteel) {
        super(scene, x, y, Atlas16, `bullet_frame_${direction}`);
        this.setBlendMode(Phaser.BlendModes.SCREEN);

        this.setDepth(Depth.TANK);
        this.ownerType = ownerType;
        this.direction = direction;
        this.speed = speed;
        this.canBreakSteel = canBreakSteel;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.bulletsManager.group.add(this);
        this.body.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        this.setVelocityByDirection();
    }

    setVelocityByDirection() {
        if (!this.body) return; // Защита, если тело еще не создано

        this.body.setAllowGravity(false); // На всякий случай выключаем гравитацию

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
}