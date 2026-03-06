import Bullet from './Bullet';
import {Direction, GameConfig, GameEvents} from '../Constants.js';

export default class BulletsManager {
    constructor(scene) {
        this.scene = scene;
        this.group = scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        this.initEventListeners(scene);
    }

    initEventListeners(scene) {
        scene.physics.world.on(GameEvents.WORLDBOUNDS, (body) => {
            if (body.gameObject && body.gameObject instanceof Bullet) {
                body.gameObject.destroy();
            }
        });
    }

    add(shooter, ownerType, speed = GameConfig.BULLET_SPEED, canBreakSteel = false) {
        const x = shooter.x;
        const y = shooter.y;

        let direction = Direction.UP;
        if (shooter.anims && shooter.anims.currentAnim) {
            direction = shooter.anims.currentAnim.key.split('-')[2];
        }

        const actualX = this.getActualX(x, direction);
        const actualY = this.getActualY(y, direction);

        return new Bullet(this.scene, actualX, actualY, direction, ownerType, speed, canBreakSteel);
    }

    getActualX(x, direction) {
        switch (direction) {
            case Direction.LEFT:
                return x - 8 - 2;
            case Direction.RIGHT:
                return x + 8 + 2;
            default:
                return x;
        }
    }

    getActualY(y, direction) {
        switch (direction) {
            case Direction.UP:
                return y - 8 - 2;
            case Direction.DOWN:
                return y + 8 + 2;
            default:
                return y;
        }
    }
}